const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());

// MongoDB connection
let db;
let usersCollection;
let todosCollection;

const connectDB = async () => {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = client.db(process.env.DB_NAME);
    usersCollection = db.collection('users');
    todosCollection = db.collection('todos');
    
    // Create indexes
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await todosCollection.createIndex({ userId: 1 });
    
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'MISSING_TOKEN',
        message: 'Authorization header missing'
      }
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'JWT token is invalid or expired'
        }
      });
    }
    req.user = user;
    next();
  });
};

// ===== AUTHENTICATION ENDPOINTS =====

// Register User
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username and password are required'
        }
      });
    }

    if (password.length < 6) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 6 characters long'
        }
      });
    }

    // Check if username exists
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: {
          code: 'USERNAME_EXISTS',
          message: 'Username already taken'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await usersCollection.insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date()
    });

    const userId = result.insertedId.toString();

    // Generate token
    const token = jwt.sign(
      { id: userId, username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    res.status(201).json({
      id: userId,
      username,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during registration'
      }
    });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username and password are required'
        }
      });
    }

    // Find user
    const user = await usersCollection.findOne({ username });
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Username or password is incorrect'
        }
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Username or password is incorrect'
        }
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id.toString(), username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    res.status(200).json({
      id: user._id.toString(),
      username: user.username,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during login'
      }
    });
  }
});

// ===== TODO ENDPOINTS =====

// Get All Todos
app.get('/todos', authenticateToken, async (req, res) => {
  try {
    const { status, sort, order } = req.query;
    const userId = req.user.id;

    // Build query
    const query = { userId };
    
    if (status === 'completed') {
      query.completed = true;
    } else if (status === 'pending') {
      query.completed = false;
    }

    // Build sort options
    const sortOptions = {};
    if (sort === 'createdAt') {
      sortOptions.createdAt = order === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = -1; // default
    }

    // Fetch todos
    const todos = await todosCollection
      .find(query)
      .sort(sortOptions)
      .toArray();

    // Format response
    const formattedTodos = todos.map(todo => ({
      id: todo._id.toString(),
      title: todo.title,
      description: todo.description || '',
      completed: todo.completed,
      createdAt: todo.createdAt
    }));

    res.status(200).json({
      todos: formattedTodos,
      total: formattedTodos.length
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching todos'
      }
    });
  }
});

// Get Single Todo
app.get('/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(404).json({
        error: {
          code: 'TODO_NOT_FOUND',
          message: 'Requested todo does not exist'
        }
      });
    }

    // Find todo
    const todo = await todosCollection.findOne({ _id: new ObjectId(id) });

    if (!todo) {
      return res.status(404).json({
        error: {
          code: 'TODO_NOT_FOUND',
          message: 'Requested todo does not exist'
        }
      });
    }

    // Check ownership
    if (todo.userId !== userId) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED_ACCESS',
          message: 'User doesn\'t have permission'
        }
      });
    }

    res.status(200).json({
      id: todo._id.toString(),
      title: todo.title,
      description: todo.description || '',
      completed: todo.completed,
      createdAt: todo.createdAt
    });
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching todo'
      }
    });
  }
});

// Create Todo
app.post('/todos', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    // Validation
    if (!title) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title is required'
        }
      });
    }

    if (title.length > 200) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title must not exceed 200 characters'
        }
      });
    }

    // Create todo
    const newTodo = {
      userId,
      title,
      description: description || '',
      completed: false,
      createdAt: new Date()
    };

    const result = await todosCollection.insertOne(newTodo);

    res.status(201).json({
      id: result.insertedId.toString(),
      title: newTodo.title,
      description: newTodo.description,
      completed: newTodo.completed,
      createdAt: newTodo.createdAt
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while creating todo'
      }
    });
  }
});

// Update Todo
app.put('/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    const userId = req.user.id;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(404).json({
        error: {
          code: 'TODO_NOT_FOUND',
          message: 'Requested todo does not exist'
        }
      });
    }

    // Find todo
    const todo = await todosCollection.findOne({ _id: new ObjectId(id) });

    if (!todo) {
      return res.status(404).json({
        error: {
          code: 'TODO_NOT_FOUND',
          message: 'Requested todo does not exist'
        }
      });
    }

    // Check ownership
    if (todo.userId !== userId) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED_ACCESS',
          message: 'User doesn\'t have permission'
        }
      });
    }

    // Validation
    if (title && title.length > 200) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title must not exceed 200 characters'
        }
      });
    }

    // Build update object
    const updateFields = { updatedAt: new Date() };
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (completed !== undefined) updateFields.completed = completed;

    // Update todo
    await todosCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    // Fetch updated todo
    const updatedTodo = await todosCollection.findOne({ _id: new ObjectId(id) });

    res.status(200).json({
      id: updatedTodo._id.toString(),
      title: updatedTodo.title,
      description: updatedTodo.description || '',
      completed: updatedTodo.completed,
      createdAt: updatedTodo.createdAt,
      updatedAt: updatedTodo.updatedAt
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while updating todo'
      }
    });
  }
});

// Delete Todo
app.delete('/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(404).json({
        error: {
          code: 'TODO_NOT_FOUND',
          message: 'Requested todo does not exist'
        }
      });
    }

    // Find todo
    const todo = await todosCollection.findOne({ _id: new ObjectId(id) });

    if (!todo) {
      return res.status(404).json({
        error: {
          code: 'TODO_NOT_FOUND',
          message: 'Requested todo does not exist'
        }
      });
    }

    // Check ownership
    if (todo.userId !== userId) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED_ACCESS',
          message: 'User doesn\'t have permission'
        }
      });
    }

    // Delete todo
    await todosCollection.deleteOne({ _id: new ObjectId(id) });

    res.status(204).send();
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while deleting todo'
      }
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});