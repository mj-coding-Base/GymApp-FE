# Docker Deployment Guide

This guide explains how to deploy the GymApp Frontend using Docker.

## Prerequisites

- Docker Engine 20.10+ or Docker Desktop
- Docker Compose 2.0+
- Minimum 2GB RAM available for the container

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### 2. Build and Run with Docker

```bash
# Build the image
docker build -t gymapp-fe:latest .

# Run the container
docker run -d \
  --name gymapp-frontend \
  -p 3002:3002 \
  -e NODE_ENV=production \
  -e PORT=3002 \
  -e NEXT_TELEMETRY_DISABLED=1 \
  --restart unless-stopped \
  gymapp-fe:latest

# View logs
docker logs -f gymapp-frontend

# Stop the container
docker stop gymapp-frontend
docker rm gymapp-frontend
```

## Environment Variables

Create a `.env` file in the project root with your production environment variables:

```env
# Application
NODE_ENV=production
PORT=3002
NEXT_TELEMETRY_DISABLED=1

# Add your environment variables here
# DATABASE_URL=your_database_url
# API_URL=your_api_url
# JWT_SECRET=your_jwt_secret
# etc.
```

To use environment variables from a file:

```bash
# With docker-compose
docker-compose --env-file .env up -d

# With docker
docker run -d \
  --name gymapp-frontend \
  -p 3002:3002 \
  --env-file .env \
  --restart unless-stopped \
  gymapp-fe:latest
```

## Production Deployment

### 1. Build for Production

```bash
# Build the production image
docker build -t gymapp-fe:production .

# Tag for registry (if deploying to a registry)
docker tag gymapp-fe:production your-registry.com/gymapp-fe:latest
```

### 2. Deploy to Registry

```bash
# Push to Docker Hub
docker login
docker tag gymapp-fe:production your-dockerhub-username/gymapp-fe:latest
docker push your-dockerhub-username/gymapp-fe:latest

# Or push to another registry
docker tag gymapp-fe:production your-registry.com/gymapp-fe:latest
docker push your-registry.com/gymapp-fe:latest
```

### 3. Pull and Run on Server

```bash
# Pull the image
docker pull your-registry.com/gymapp-fe:latest

# Run the container
docker run -d \
  --name gymapp-frontend \
  -p 3002:3002 \
  --env-file .env.production \
  --restart unless-stopped \
  your-registry.com/gymapp-fe:latest
```

## Monitoring and Health Checks

The container includes a health check that runs every 30 seconds:

```bash
# Check container status
docker ps

# Check container health
docker inspect --format='{{.State.Health.Status}}' gymapp-frontend

# View health check logs
docker inspect --format='{{json .State.Health}}' gymapp-frontend
```

## Troubleshooting

### View Logs

```bash
# With docker-compose
docker-compose logs -f gymapp-fe

# With docker
docker logs -f gymapp-frontend
```

### Debug Container Issues

```bash
# Execute a shell in the container
docker exec -it gymapp-frontend sh

# Check Node.js version
docker exec gymapp-frontend node --version

# Check application files
docker exec gymapp-frontend ls -la
```

### Rebuild After Changes

```bash
# Rebuild without cache
docker-compose build --no-cache

# Restart the container
docker-compose up -d
```

## Docker Image Optimization

The Dockerfile uses multi-stage builds for optimal image size:

1. **deps stage**: Installs all dependencies (including devDependencies)
2. **builder stage**: Builds the Next.js application
3. **runner stage**: Minimal runtime image with only production files

### Image Size Reduction Tips

- Uses Alpine Linux base image (smaller than Debian)
- Only includes production dependencies in final image
- Uses Next.js standalone output for minimal runtime
- Runs as non-root user for security

## Security Best Practices

1. **Non-root user**: The container runs as user `nextjs` (UID 1001) instead of root
2. **Minimal attack surface**: Uses Alpine Linux with minimal packages
3. **Security headers**: Configured in next.config.ts
4. **Environment variables**: Use Docker secrets or environment files, never commit secrets
5. **Keep updated**: Regularly update base images and dependencies

## Resource Limits

The docker-compose.yml includes default resource limits. Adjust based on your server capacity:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'      # Maximum 2 CPU cores
      memory: 2G     # Maximum 2GB RAM
    reservations:
      cpus: '1'      # Reserved 1 CPU core
      memory: 1G     # Reserved 1GB RAM
```

## Reverse Proxy Configuration

### Nginx Example

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Traefik Example

Add labels to docker-compose.yml:

```yaml
services:
  gymapp-fe:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.gymapp.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.gymapp.entrypoints=websecure"
      - "traefik.http.routers.gymapp.tls.certresolver=letsencrypt"
      - "traefik.http.services.gymapp.loadbalancer.server.port=3002"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t gymapp-fe:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          docker tag gymapp-fe:${{ github.sha }} your-registry.com/gymapp-fe:${{ github.sha }}
          docker push your-registry.com/gymapp-fe:${{ github.sha }}
      
      - name: Deploy to server
        run: |
          ssh user@server "docker pull your-registry.com/gymapp-fe:${{ github.sha }}"
          ssh user@server "docker stop gymapp-frontend && docker rm gymapp-frontend"
          ssh user@server "docker run -d --name gymapp-frontend -p 3002:3002 your-registry.com/gymapp-fe:${{ github.sha }}"
```

## Performance Optimization

1. **Build cache**: Docker automatically caches layers to speed up rebuilds
2. **Standalone output**: Next.js standalone mode for faster startup
3. **Health checks**: Automatic container health monitoring
4. **Resource limits**: Prevent resource exhaustion

## Support

For issues or questions, please check:
- Docker logs: `docker-compose logs -f`
- Container health: `docker ps`
- Next.js documentation: https://nextjs.org/docs
- Docker documentation: https://docs.docker.com

