# Todo App - Angular Frontend

A simple Angular application that consumes the Todo API with authentication.

## Features

- User registration and login
- Create, read, update, and delete todos
- Mark todos as completed
- Server number display on all screens

## Configuration

The application uses environment variables for configuration. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Then edit `.env` to set your backend API URL:

```env
VITE_API_URL=http://18.212.160.227:8000/
VITE_SERVER_NUMBER=1
FRONTEND_PORT=80
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

The application reads configuration from environment variables:

- `VITE_API_URL`: Backend API endpoint (required)
- `VITE_SERVER_NUMBER`: Server identifier to display (optional, defaults to 1)
- `FRONTEND_PORT`: Port to expose in Docker (optional, defaults to 80)

When running with Docker, these variables are passed through docker-compose.

## API Integration

The application expects the backend API to be available at the URL specified in `API_URL`. The API should implement the endpoints documented in the API documentation.

## Application Structure

- `src/services/` - Authentication and Todo services
- `src/components/` - Auth and Todos components
- `public/env.js` - Runtime configuration
- `Dockerfile` - Container configuration
- `nginx.conf` - Nginx routing configuration
