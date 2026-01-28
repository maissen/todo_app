# Todo App Frontend

A modern, responsive web application for managing todos. Built with vanilla HTML, CSS, and JavaScript.

## Features

- 🔐 User authentication (login/register)
- ✅ Create, read, update, and delete todos
- 🎯 Filter todos by status (all, pending, completed)
- 🔄 Sort todos by creation date
- 📱 Fully responsive design
- 💾 Persistent authentication with localStorage
- 🎨 Clean and modern UI

## Prerequisites

- Docker and Docker Compose
- Backend API running (or configure API_URL to point to your backend)

## Environment Variables

Create a `.env` file in the root directory:

```env
# API Base URL - Update this to point to your backend API
API_URL=http://localhost:3000

# Frontend Port
FRONTEND_PORT=8080
```

**Important Configuration Notes:**

### For Local Development (Backend on Host)
```env
API_URL=http://localhost:3000
```

### For Docker Network (All services in Docker)
```env
API_URL=http://todo-api:3000
```

### For Production
```env
API_URL=https://api.yourdomain.com
```

## Quick Start

### Option 1: Frontend Only (Backend Running Separately)

1. **Update `.env` with your backend URL:**
   ```env
   API_URL=http://localhost:3000
   FRONTEND_PORT=8080
   ```

2. **Build and start the container:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:8080`

### Option 2: With Backend (Using Docker Compose Profiles)

If you have the backend Docker image available:

```bash
docker-compose --profile with-backend up -d
```

This will start both frontend and backend services.

### Option 3: Local Development (No Docker)

1. **Create `env.js` file manually:**
   ```javascript
   window.ENV = {
       API_URL: 'http://localhost:3000'
   };
   ```

2. **Serve the files with any HTTP server:**
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js (npx)
   npx serve -p 8080
   
   # Using PHP
   php -S localhost:8080
   ```

3. **Open browser:**
   Navigate to `http://localhost:8080`

## Docker Commands

### Build the image
```bash
docker-compose build
```

### Start the service
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f todo-frontend
```

### Stop the service
```bash
docker-compose down
```

### Restart the service
```bash
docker-compose restart
```

## File Structure

```
frontend/
├── index.html              # Main HTML file
├── styles.css              # Styling
├── app.js                  # Application logic and API integration
├── nginx.conf              # Nginx configuration
├── docker-entrypoint.sh    # Entrypoint script for env injection
├── env.template.js         # Template for environment variables
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker Compose configuration
├── .env                    # Environment variables (not in git)
├── .dockerignore          # Docker ignore rules
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## API Integration

The frontend communicates with the backend API using the following endpoints:

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Todos
- `GET /todos` - Get all todos (with optional filters)
- `GET /todos/:id` - Get single todo
- `POST /todos` - Create new todo
- `PUT /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo

All todo endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Features in Detail

### Authentication
- Users can register with username and password
- Login persists across browser sessions using localStorage
- Automatic redirect to login on authentication failure
- Secure JWT token handling

### Todo Management
- Create todos with title and optional description
- Mark todos as complete/incomplete with checkbox
- Edit existing todos (title, description, completion status)
- Delete todos with confirmation
- Real-time UI updates

### Filtering & Sorting
- Filter by status: All, Pending, Completed
- Sort by creation date: Newest first or Oldest first
- Filters and sorts persist during session

### UI/UX
- Clean, modern design with smooth animations
- Responsive layout for mobile and desktop
- Loading states and error handling
- Empty state when no todos exist
- Modal for editing todos

## CORS Configuration

If you encounter CORS issues, ensure your backend API includes the appropriate CORS headers. Example backend configuration:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

Or use the `cors` package:

```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
```

## Troubleshooting

### Cannot connect to API
- Verify backend is running
- Check `API_URL` in `.env` file
- Ensure no CORS issues (check browser console)
- Verify network connectivity between containers

### Container won't start
- Check if port 8080 is already in use: `netstat -an | grep 8080`
- View logs: `docker-compose logs todo-frontend`
- Ensure Dockerfile builds successfully: `docker-compose build`

### Authentication not persisting
- Check browser localStorage (F12 → Application → Local Storage)
- Ensure cookies/localStorage are not disabled
- Try clearing browser cache and localStorage

### Styles not loading
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check nginx logs: `docker-compose logs todo-frontend`
- Verify all files are copied in Dockerfile

## Production Deployment

### Recommendations

1. **Use HTTPS**
   - Configure SSL/TLS certificates in Nginx
   - Update API_URL to use HTTPS

2. **Environment Variables**
   - Use proper secrets management
   - Never commit `.env` files to version control

3. **Nginx Optimization**
   - Enable HTTP/2
   - Configure rate limiting
   - Add proper security headers (already included)

4. **Docker**
   - Use multi-stage builds for smaller images
   - Scan images for vulnerabilities
   - Use specific version tags

5. **Monitoring**
   - Set up health check monitoring
   - Configure logging
   - Monitor application performance

### Example Production nginx.conf additions

```nginx
# HTTP/2
listen 443 ssl http2;

# SSL Configuration
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;

# Rate limiting
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;
limit_req zone=mylimit burst=20;
```

## License

ISC

## Support

For issues and questions, please check the backend API documentation and ensure all services are properly configured.
