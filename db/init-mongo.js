// MongoDB initialization script
// This script creates a dedicated user for the Todo application

db = db.getSiblingDB('todo_db');

// Create application user with read/write permissions
db.createUser({
  user: process.env.MONGO_APP_USERNAME || 'todoapp',
  pwd: process.env.MONGO_APP_PASSWORD || 'change-this-app-password',
  roles: [
    {
      role: 'readWrite',
      db: 'todo_db'
    }
  ]
});

// Create collections
db.createCollection('users');
db.createCollection('todos');

// Create indexes for better performance
db.users.createIndex({ username: 1 }, { unique: true });
db.todos.createIndex({ userId: 1 });
db.todos.createIndex({ createdAt: -1 });

print('MongoDB initialization completed successfully');
print('Database: todo_db');
print('Collections created: users, todos');
print('Indexes created successfully');
