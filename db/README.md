# MongoDB Database Setup

This folder contains the MongoDB database configuration for the Todo API.

## Files

- **docker-compose.yml** - MongoDB container orchestration
- **.env** - MongoDB environment variables and credentials
- **init-mongo.js** - Database initialization script

## Quick Start

1. **Update credentials in `.env`:**
   ```env
   MONGO_ROOT_USERNAME=admin
   MONGO_ROOT_PASSWORD=your-strong-password
   MONGO_APP_USERNAME=todoapp
   MONGO_APP_PASSWORD=your-app-password
   ```

2. **Start MongoDB:**
   ```bash
   docker-compose up -d
   ```

3. **Verify MongoDB is running:**
   ```bash
   docker-compose logs -f
   ```

4. **Check health status:**
   ```bash
   docker-compose ps
   ```

## Configuration

### Environment Variables

- `MONGO_PORT` - Port to expose MongoDB (default: 27017)
- `MONGO_ROOT_USERNAME` - Root/admin username
- `MONGO_ROOT_PASSWORD` - Root/admin password
- `MONGO_INITDB_DATABASE` - Initial database name (todo_db)
- `MONGO_APP_USERNAME` - Application user with read/write access
- `MONGO_APP_PASSWORD` - Application user password

### Volumes

Data is persisted in Docker volumes:
- `mongodb_data` - Database files
- `mongodb_config` - Configuration files

## Connecting to MongoDB

### From Host Machine

```bash
mongosh "mongodb://admin:your-password@localhost:27017/admin"
```

### From Application

Use this connection string in your backend `.env`:

```
MONGODB_URI=mongodb://todoapp:your-app-password@localhost:27017/todo_db?authSource=todo_db
```

If using Docker network (recommended):
```
MONGODB_URI=mongodb://todoapp:your-app-password@todo-mongodb:27017/todo_db?authSource=todo_db
```

## Database Structure

### Collections

1. **users**
   - Stores user accounts
   - Index: `username` (unique)

2. **todos**
   - Stores todo items
   - Index: `userId`, `createdAt`

## Security Notes

1. **Change default passwords** - Never use default credentials in production
2. **Use strong passwords** - Minimum 16 characters with mixed case, numbers, and symbols
3. **Network isolation** - Use Docker networks to isolate database access
4. **Backup regularly** - Set up automated backups for production

## Backup and Restore

### Backup
```bash
docker exec todo-mongodb mongodump --username admin --password your-password --authenticationDatabase admin --out /data/backup
docker cp todo-mongodb:/data/backup ./backup
```

### Restore
```bash
docker cp ./backup todo-mongodb:/data/backup
docker exec todo-mongodb mongorestore --username admin --password your-password --authenticationDatabase admin /data/backup
```

## Useful Commands

### Stop MongoDB
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes all data)
```bash
docker-compose down -v
```

### View logs
```bash
docker-compose logs -f mongodb
```

### Access MongoDB shell
```bash
docker exec -it todo-mongodb mongosh -u admin -p your-password --authenticationDatabase admin
```

### Check MongoDB status
```bash
docker exec todo-mongodb mongosh --eval "db.adminCommand('ping')"
```

## Troubleshooting

### Connection refused
- Check if MongoDB container is running: `docker-compose ps`
- Verify port is not in use: `netstat -an | grep 27017`
- Check logs: `docker-compose logs mongodb`

### Authentication failed
- Verify credentials in `.env`
- Ensure you're using the correct authentication database
- Check if init script ran successfully

### Permission denied
- Ensure proper file permissions on `init-mongo.js`
- Check Docker volume permissions

## Production Recommendations

1. Use MongoDB replica sets for high availability
2. Enable SSL/TLS for encrypted connections
3. Implement regular backup strategy
4. Monitor MongoDB performance and logs
5. Use secrets management (Docker secrets, Kubernetes secrets)
6. Limit network exposure (use internal networks only)
7. Keep MongoDB version updated
