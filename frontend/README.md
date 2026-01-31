# Todo App - Web Client

A simple, stunning todo application with an olive green theme that consumes the Todo API.

## Features

- User registration and login
- Create, read, update, and delete todos
- Mark todos as completed
- Filter todos (All, Pending, Completed)
- Beautiful olive green themed UI
- Responsive design
- Server number display badge

## Quick Start

### Using Docker Compose (Recommended)

1. Make sure Docker and Docker Compose are installed
2. Run the application:

```bash
docker-compose up -d
```

3. Access the app at `http://localhost`

### Manual Docker Build

```bash
docker build -t todo-web .
docker run -d -p 80:80 --name todo-web todo-web
```

### Stop the Application

```bash
docker-compose down
```

## Configuration

Edit `env.js` to change the API URL or server number:

```javascript
const ENV = {
  API_URL: 'http://3.82.236.145:8000',
  SERVER_NUMBER: '1'
};
```

## File Structure

```
.
├── index.html          # Login/Register page
├── app.html           # Main todo application page
├── styles.css         # Styles with olive green theme
├── auth.js            # Authentication logic
├── app.js             # Todo management logic
├── env.js             # Environment configuration
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose configuration
└── README.md          # This file
```

## Technology Stack

- HTML5
- CSS3 (vanilla, no frameworks)
- JavaScript (vanilla, no frameworks)
- Nginx (Alpine)
- Docker

## Notes

- Authentication tokens are stored in sessionStorage (temporary, cleared when browser closes)
- No data is cached - everything is fetched fresh from the API
- Simple and minimal code to avoid debugging issues
- Beautiful, modern UI with smooth transitions
