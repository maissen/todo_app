# Quick Start Guide

## Prerequisites
- Docker and Docker Compose installed
- A running Todo API backend server

## Step 1: Configure Environment

Edit `env.js` and update the backend API URL:

```javascript
const ENV = {
  API_BASE_URL: 'http://your-backend-server:3000',  // ← Change this!
  SERVER_NUMBER: '1',  // ← Change this for each server instance
  APP_NAME: 'Todo Application',
  VERSION: '1.0.0'
};
```

## Step 2: Deploy

### Option A: Using the Build Script (Recommended)
```bash
./build.sh
# Select option 1 to build and start
```

### Option B: Using Docker Compose Directly
```bash
docker-compose up -d --build
```

### Option C: Manual Docker Build
```bash
# Build the image
docker build -t todo-frontend .

# Run the container
docker run -d -p 8080:80 --name todo-app todo-frontend
```

## Step 3: Access the Application

Open your browser and navigate to:
```
http://localhost:8080
```

## Step 4: Test the Application

1. **Register a new account**
   - Click "Register" tab
   - Enter username and password
   - Click "Register"

2. **Create your first todo**
   - Click "+ Add Todo"
   - Enter a title and optional description
   - Click "Save"

3. **Manage todos**
   - Edit: Click the ✏️ icon
   - Delete: Click the 🗑️ icon
   - Complete: Click the ✓ icon

## Troubleshooting

### Can't connect to backend?
- Check if backend server is running
- Verify `API_BASE_URL` in `env.js` is correct
- Check backend CORS settings

### Port 8080 already in use?
Edit `docker-compose.yml` and change the port:
```yaml
ports:
  - "3000:80"  # Change 8080 to 3000 (or any available port)
```

### Need to see logs?
```bash
docker-compose logs -f
```

### Need to rebuild?
```bash
docker-compose down
docker-compose up -d --build
```

## Multiple Server Instances

To run multiple instances:

1. Copy the entire project to a new folder
2. Edit `env.js` and change `SERVER_NUMBER`
3. Edit `docker-compose.yml` and change the port
4. Run `docker-compose up -d --build`

Example for Server 2:
```javascript
// env.js
SERVER_NUMBER: '2'
```

```yaml
# docker-compose.yml
ports:
  - "8081:80"  # Different port
```

## Stopping the Application

```bash
docker-compose down
```

## Complete Cleanup

```bash
# Stop and remove containers
docker-compose down -v

# Remove the image
docker rmi todo-frontend
```

## Next Steps

- Configure your backend API URL in production
- Set up HTTPS with a reverse proxy (nginx/Apache)
- Implement monitoring and logging
- Set up automated backups

## Support

Refer to the main `README.md` for detailed documentation.
