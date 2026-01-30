# Deployment Instructions

## Environment Setup

Create a `.env` file in the frontend directory with your configuration:

```env
VITE_API_URL=http://your-backend-ip:8000
VITE_SERVER_NUMBER=1
FRONTEND_PORT=80
```

## Docker Deployment

1. Build and run with Docker Compose:
```bash
sudo docker compose up -d --build
```

## How it works

1. The `.env` file provides environment variables to Docker
2. During Docker build, `env.template.js` is processed to create `env.js` with actual values
3. The Angular app loads `env.js` which sets `window.__ENV` 
4. `environments.ts` reads from `window.__ENV` to configure the API URL

## Troubleshooting

If you see "undefined" in API URLs:
- Check that your `.env` file exists and has the correct VITE_API_URL
- Verify the Docker build completed successfully
- Check that `env.js` was generated in the container