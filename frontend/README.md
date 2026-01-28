# Todo App - Angular Frontend

A simple Angular application that consumes the Todo API with authentication.

## Features

- User registration and login
- Create, read, update, and delete todos
- Mark todos as completed
- Server number display on all screens

## Configuration

Edit `public/env.js` to configure the application:

```javascript
window.ENV = {
  API_URL: 'http://localhost:3000',  // Your backend API URL
  SERVER_NUMBER: '1'                  // Server identifier to display
};
```

## Running Locally

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Open browser to `http://localhost:4200`

## Docker Deployment

1. Build the Docker image:
```bash
docker build -t todo-app .
```

2. Run the container:
```bash
docker run -p 80:80 todo-app
```

3. Access the application at `http://localhost`

## Environment Variables

You can override the environment variables at runtime by mounting a custom `env.js` file:

```bash
docker run -p 80:80 -v $(pwd)/env.js:/usr/share/nginx/html/env.js todo-app
```

Example `env.js`:
```javascript
window.ENV = {
  API_URL: 'https://api.example.com',
  SERVER_NUMBER: '2'
};
```

## API Integration

The application expects the backend API to be available at the URL specified in `API_URL`. The API should implement the endpoints documented in the API documentation.

## Application Structure

- `src/services/` - Authentication and Todo services
- `src/components/` - Auth and Todos components
- `public/env.js` - Runtime configuration
- `Dockerfile` - Container configuration
- `nginx.conf` - Nginx routing configuration
