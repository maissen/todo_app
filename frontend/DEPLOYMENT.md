# Deployment Guide

This guide covers different deployment scenarios for the Todo Application frontend.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Multiple Server Instances](#multiple-server-instances)
4. [Production Deployment](#production-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Reverse Proxy Setup](#reverse-proxy-setup)

---

## Local Development

### Using Python HTTP Server
```bash
python3 -m http.server 8080
```
Access at: `http://localhost:8080`

### Using Node.js
```bash
npx http-server -p 8080
```

### Using PHP
```bash
php -S localhost:8080
```

**Note**: Remember to update `env.js` with your backend API URL before testing.

---

## Docker Deployment

### Quick Start
```bash
# Build and run
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Manual Docker Commands
```bash
# Build image
docker build -t todo-frontend:latest .

# Run container
docker run -d \
  --name todo-frontend \
  -p 8080:80 \
  --restart unless-stopped \
  todo-frontend:latest

# Check status
docker ps

# View logs
docker logs -f todo-frontend

# Stop and remove
docker stop todo-frontend
docker rm todo-frontend
```

---

## Multiple Server Instances

### Scenario: Running 3 server instances

#### Server 1 Configuration
```bash
# Directory: /app/server1
cd /app/server1

# Edit env.js
API_BASE_URL: 'http://backend-server:3000'
SERVER_NUMBER: '1'

# Edit docker-compose.yml
ports:
  - "8081:80"

# Deploy
docker-compose up -d --build
```

#### Server 2 Configuration
```bash
# Directory: /app/server2
cd /app/server2

# Edit env.js
API_BASE_URL: 'http://backend-server:3000'
SERVER_NUMBER: '2'

# Edit docker-compose.yml
ports:
  - "8082:80"

# Deploy
docker-compose up -d --build
```

#### Server 3 Configuration
```bash
# Directory: /app/server3
cd /app/server3

# Edit env.js
API_BASE_URL: 'http://backend-server:3000'
SERVER_NUMBER: '3'

# Edit docker-compose.yml
ports:
  - "8083:80"

# Deploy
docker-compose up -d --build
```

### Load Balancer Setup (Nginx)
```nginx
upstream todo_backends {
    server localhost:8081;
    server localhost:8082;
    server localhost:8083;
}

server {
    listen 80;
    server_name todo.example.com;

    location / {
        proxy_pass http://todo_backends;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Production Deployment

### Pre-deployment Checklist
- [ ] Update `API_BASE_URL` in `env.js` to production backend URL
- [ ] Set appropriate `SERVER_NUMBER` for each instance
- [ ] Configure HTTPS (see Reverse Proxy Setup below)
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Test CORS settings with backend
- [ ] Review security headers in `nginx.conf`

### Environment Configuration for Production
```javascript
// env.js
const ENV = {
  API_BASE_URL: 'https://api.yourcompany.com',  // Production API
  SERVER_NUMBER: '1',  // Unique per instance
  APP_NAME: 'Todo Application',
  VERSION: '1.0.0'
};
```

### Docker Production Setup
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  todo-frontend:
    build: .
    container_name: todo-frontend-prod
    ports:
      - "8080:80"
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - production

networks:
  production:
    driver: bridge
```

Deploy:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Cloud Deployment

### AWS ECS (Elastic Container Service)

1. **Build and push to ECR**:
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t todo-frontend .

# Tag image
docker tag todo-frontend:latest \
  YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/todo-frontend:latest

# Push to ECR
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/todo-frontend:latest
```

2. **Create ECS Task Definition** (JSON):
```json
{
  "family": "todo-frontend",
  "containerDefinitions": [
    {
      "name": "todo-frontend",
      "image": "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/todo-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "memory": 512,
      "cpu": 256
    }
  ]
}
```

### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/YOUR_PROJECT/todo-frontend

# Deploy to Cloud Run
gcloud run deploy todo-frontend \
  --image gcr.io/YOUR_PROJECT/todo-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 80
```

### Azure Container Instances

```bash
# Build and push to ACR
az acr build --registry YOUR_REGISTRY \
  --image todo-frontend:latest .

# Deploy to ACI
az container create \
  --resource-group YOUR_RESOURCE_GROUP \
  --name todo-frontend \
  --image YOUR_REGISTRY.azurecr.io/todo-frontend:latest \
  --dns-name-label todo-app \
  --ports 80
```

### DigitalOcean App Platform

1. Create `app.yaml`:
```yaml
name: todo-frontend
services:
- name: web
  dockerfile_path: Dockerfile
  github:
    repo: your-username/todo-frontend
    branch: main
  http_port: 80
  routes:
  - path: /
```

2. Deploy:
```bash
doctl apps create --spec app.yaml
```

---

## Reverse Proxy Setup

### Nginx with SSL (Let's Encrypt)

1. **Install Certbot**:
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

2. **Nginx Configuration** (`/etc/nginx/sites-available/todo-app`):
```nginx
server {
    listen 80;
    server_name todo.example.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name todo.example.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/todo.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/todo.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. **Enable site and get SSL certificate**:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/todo-app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Get SSL certificate
sudo certbot --nginx -d todo.example.com

# Reload nginx
sudo systemctl reload nginx
```

### Apache with SSL

```apache
<VirtualHost *:80>
    ServerName todo.example.com
    Redirect permanent / https://todo.example.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName todo.example.com

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/todo.example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/todo.example.com/privkey.pem

    ProxyPreserveHost On
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/

    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
</VirtualHost>
```

### Traefik (Docker)

```yaml
# docker-compose.yml with Traefik
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=your-email@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"

  todo-frontend:
    build: .
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.todo.rule=Host(`todo.example.com`)"
      - "traefik.http.routers.todo.entrypoints=websecure"
      - "traefik.http.routers.todo.tls.certresolver=letsencrypt"
```

---

## Monitoring & Health Checks

### Docker Health Check
Add to `Dockerfile`:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1
```

### Monitoring Script
```bash
#!/bin/bash
# monitor.sh

while true; do
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)
    if [ "$response" != "200" ]; then
        echo "Health check failed! Status: $response"
        # Send alert or restart container
    else
        echo "Health check OK"
    fi
    sleep 60
done
```

---

## Troubleshooting Deployment

### Container won't start
```bash
# Check logs
docker logs todo-frontend

# Check if port is in use
sudo lsof -i :8080

# Inspect container
docker inspect todo-frontend
```

### CORS errors
Ensure backend has proper CORS headers:
```javascript
// Backend (Express example)
app.use(cors({
  origin: 'https://todo.example.com',
  credentials: true
}));
```

### SSL certificate issues
```bash
# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

---

## Backup & Recovery

### Backup Strategy
```bash
# Backup environment config
cp env.js env.js.backup

# Export Docker image
docker save todo-frontend:latest | gzip > todo-frontend-backup.tar.gz

# Restore
docker load < todo-frontend-backup.tar.gz
```

---

## Performance Optimization

### Enable Gzip (Already in nginx.conf)
- All text assets compressed
- Reduces bandwidth by ~70%

### CDN Integration
```nginx
# Add CDN headers
location ~* \.(css|js|jpg|png|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header CDN-Cache-Control "public, max-age=31536000";
}
```

### HTTP/2 Push
```nginx
http2_push /styles.css;
http2_push /app.js;
http2_push /env.js;
```

---

## Security Best Practices

1. **Always use HTTPS in production**
2. **Keep Docker images updated**
3. **Use environment variables for sensitive data**
4. **Implement rate limiting at reverse proxy**
5. **Regular security audits**
6. **Monitor access logs**
7. **Use Content Security Policy headers**

---

## Scaling Considerations

### Horizontal Scaling
- Run multiple instances with different SERVER_NUMBER
- Use load balancer (nginx, HAProxy, AWS ALB)
- Session data stored in backend (stateless frontend)

### Vertical Scaling
- Increase container resources in docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

---

For additional help, refer to:
- README.md - Complete documentation
- QUICKSTART.md - Quick start guide
- FEATURES.md - Feature overview
