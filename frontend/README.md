# Todo Application - Frontend

A modern, responsive Todo application built with vanilla HTML, CSS, and JavaScript that consumes a RESTful API.

## Features

- **User Authentication**: Register and login functionality with JWT tokens
- **Todo Management**: Create, read, update, and delete todos
- **Filtering & Sorting**: Filter by status (completed/pending) and sort by date
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Server Badge**: Displays the server number on all screens
- **Containerized**: Ready to deploy with Docker

## Project Structure

```
.
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── app.js             # Application logic
├── env.js             # Environment configuration
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose configuration
├── nginx.conf         # Nginx server configuration
├── .dockerignore      # Docker ignore file
├── .env.example       # Environment variables example
└── README.md          # This file
```

## Prerequisites

- Docker and Docker Compose installed on your system
- A running Todo API backend server

## Configuration

### Environment Variables

Edit the `env.js` file to configure your application:

```javascript
const ENV = {
  API_BASE_URL: 'http://localhost:3000',  // Your backend API URL
  SERVER_NUMBER: '1',                      // Server identifier
  APP_NAME: 'Todo Application',
  VERSION: '1.0.0'
};
```

**Important**: Update `API_BASE_URL` to point to your backend server before deploying.

## Running the Application

### Using Docker Compose (Recommended)

1. **Configure the environment**:
   ```bash
   # Edit env.js and update API_BASE_URL to your backend server
   nano env.js
   ```

2. **Build and run the container**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   Open your browser and navigate to `http://localhost:8080`

4. **Stop the application**:
   ```bash
   docker-compose down
   ```

### Using Docker

1. **Build the Docker image**:
   ```bash
   docker build -t todo-frontend .
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 8080:80 --name todo-app todo-frontend
   ```

3. **Access the application**:
   Open your browser and navigate to `http://localhost:8080`

4. **Stop the container**:
   ```bash
   docker stop todo-app
   docker rm todo-app
   ```

### Running without Docker

1. **Serve the files using any web server**:
   
   Using Python:
   ```bash
   python3 -m http.server 8080
   ```
   
   Using Node.js (install `http-server` first):
   ```bash
   npx http-server -p 8080
   ```

2. **Access the application**:
   Open your browser and navigate to `http://localhost:8080`

## Usage Guide

### Registration

1. Click on the "Register" tab
2. Enter a username and password
3. Confirm your password
4. Click "Register" to create your account

### Login

1. Click on the "Login" tab
2. Enter your username and password
3. Click "Login" to access your todos

### Managing Todos

- **Create Todo**: Click the "+ Add Todo" button, fill in the details, and save
- **Edit Todo**: Click the edit (✏️) icon on any todo item
- **Delete Todo**: Click the delete (🗑️) icon and confirm deletion
- **Mark Complete**: Click the checkmark (✓) to toggle completion status
- **Filter Todos**: Use the dropdown to filter by status (All/Pending/Completed)
- **Sort Todos**: Use the sort dropdown to order by date (Newest/Oldest first)

## API Endpoints Used

The application consumes the following API endpoints:

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token

### Todos
- `GET /todos` - Get all todos (with optional filters)
- `GET /todos/:id` - Get a specific todo
- `POST /todos` - Create a new todo
- `PUT /todos/:id` - Update a todo
- `DELETE /todos/:id` - Delete a todo

## Features in Detail

### Server Badge
The server number is displayed in the top-right corner of every screen, making it easy to identify which server instance is serving the application.

### Authentication
- JWT token-based authentication
- Tokens are stored in localStorage
- Automatic logout on token expiration
- Session persistence across page refreshes

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px and 480px
- Touch-friendly interface on mobile devices

### Error Handling
- User-friendly error messages
- Network error detection
- Validation feedback
- Session expiration handling

## Customization

### Changing Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #4f46e5;
    --primary-hover: #4338ca;
    --secondary-color: #6b7280;
    /* ... other colors */
}
```

### Changing Port

Edit `docker-compose.yml`:

```yaml
ports:
  - "3000:80"  # Change 3000 to your desired port
```

## Troubleshooting

### Cannot connect to backend
- Ensure your backend server is running
- Verify the `API_BASE_URL` in `env.js` is correct
- Check CORS settings on your backend server

### CORS Issues
Your backend server must allow requests from the frontend origin. Add appropriate CORS headers:
- `Access-Control-Allow-Origin: *` (or specific origin)
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

### Port already in use
```bash
# Change the port in docker-compose.yml or use a different port:
docker-compose up -d --build
```

## Security Considerations

- JWT tokens are stored in localStorage (consider using httpOnly cookies in production)
- Always use HTTPS in production
- Implement rate limiting on the backend
- Validate all user inputs
- Use environment-specific configurations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

To modify the application:

1. Edit the source files (`index.html`, `styles.css`, `app.js`, `env.js`)
2. Rebuild the Docker image:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

## Production Deployment

1. Update `env.js` with production API URL
2. Update `SERVER_NUMBER` to identify the server instance
3. Build and deploy using Docker:
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please refer to the API documentation or contact your system administrator.
