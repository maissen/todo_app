# Todo App Frontend

A containerized todo application frontend built with HTML, CSS, and JavaScript.

## Features

- ✅ User authentication (login/register)
- ✅ Create, read, update, delete todos
- ✅ Filter todos (all, pending, completed)
- ✅ Mark todos as complete
- ✅ Responsive design
- ✅ Brutalist/minimal aesthetic with distinctive design
- ✅ Server number display on all screens

## Configuration

Edit `env.js` to configure the application:

```javascript
window.ENV = {
  API_BASE_URL: 'http://localhost:3000', // Your backend API URL
  SERVER_NUMBER: 'Server #1', // Server identifier to display
};
```

## Docker Setup

### Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up -d

# Stop the container
docker-compose down

# View logs
docker-compose logs -f
```

The application will be available at `http://localhost:8080`

### Build and Run with Docker

```bash
# Build the image
docker build -t todo-frontend .

# Run the container
docker run -d -p 8080:80 --name todo-frontend todo-frontend

# Stop the container
docker stop todo-frontend

# Remove the container
docker rm todo-frontend
```

## Running Locally (Without Docker)

Simply open `index.html` in a web browser, or use a local web server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js http-server
npx http-server -p 8080
```

## Usage

1. **Register**: Create a new account with username and password
2. **Login**: Log in with your credentials
3. **Create Todo**: Click "New Task" to add a todo
4. **Edit Todo**: Click "Edit" on any todo item
5. **Complete Todo**: Click the checkbox to mark as complete
6. **Filter**: Use the filter buttons to view all, pending, or completed todos
7. **Delete**: Click "Delete" to remove a todo

## Tech Stack

- HTML5
- CSS3 (with custom brutalist design)
- Vanilla JavaScript
- Docker & Nginx
- Google Fonts (Syne, JetBrains Mono)

## Design

The interface features a bold brutalist/minimal aesthetic with:
- High contrast dark theme
- Distinctive typography (Syne for headings, JetBrains Mono for UI)
- Neon green accent color
- Animated background pattern
- Box-shadow effects
- Smooth transitions and micro-interactions

## API Integration

The app integrates with the Todo API using the following endpoints:
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /todos` - Get all todos (with filtering)
- `POST /todos` - Create new todo
- `PUT /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
