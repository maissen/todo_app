# Todo API

A RESTful API for managing todos with JWT authentication and MongoDB.

## Features

- User registration and authentication with JWT
- CRUD operations for todos
- Filter and sort todos
- Per-user todo isolation
- Comprehensive error handling

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose (for containerized deployment)
- Remote MongoDB instance

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://username:password@your-remote-host:27017/todo_db?authSource=admin
DB_NAME=todo_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=24h
```

**Important:** Update the following values:
- `MONGODB_URI`: Your actual MongoDB connection string
- `JWT_SECRET`: Use a strong, random secret key

## Installation

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Docker Deployment

1. Build and start the container:
```bash
docker-compose up -d
```

2. View logs:
```bash
docker-compose logs -f
```

3. Stop the container:
```bash
docker-compose down
```

## API Endpoints

### Authentication

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword"
}
```

### Todos

All todo endpoints require authentication via JWT token:
```
Authorization: Bearer <your_jwt_token>
```

#### Get All Todos
```
GET /todos
GET /todos?status=completed
GET /todos?status=pending&sort=createdAt&order=asc
```

#### Get Single Todo
```
GET /todos/:id
```

#### Create Todo
```
POST /todos
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

#### Update Todo
```
PUT /todos/:id
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, butter",
  "completed": true
}
```

#### Delete Todo
```
DELETE /todos/:id
```

## Health Check

```
GET /health
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

## Security Notes

1. Always use HTTPS in production
2. Change the `JWT_SECRET` to a strong, random value
3. Use environment variables for sensitive data
4. Implement rate limiting for production use
5. Add CORS configuration as needed

## License

ISC