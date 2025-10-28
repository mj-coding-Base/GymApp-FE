# VPS Deployment Guide - Fix LightningCSS Issue

## Problem
Build fails on VPS with:
```
Error: Cannot find module '../lightningcss.linux-x64-gnu.node'
```

## Solution: Use Docker

Instead of building directly on the VPS with `npm run build`, use Docker which handles all native dependencies correctly.

### Quick Start

1. **On your VPS, navigate to your project:**
```bash
cd /srv/gymapp-fe
```

2. **Pull the latest changes:**
```bash
git pull
```

3. **Use the deployment script:**
```bash
chmod +x deploy.sh
./deploy.sh
```

Or manually:
```bash
docker-compose up -d --build
```

4. **Check if it's running:**
```bash
docker-compose ps
docker-compose logs -f
```

### What Changed

The **Dockerfile** now includes a comprehensive fix for lightningcss:

```dockerfile
# Strategy 1: Copy binary from subdirectory to parent
# Strategy 2: Reinstall lightningcss
# Strategy 3: Download binary manually if needed
```

This ensures the native binary is always in the correct location.

### Verify Deployment

```bash
# Check container
docker ps | grep gymapp

# View logs
docker logs gymapp-frontend

# Test the app
curl http://localhost:3002
```

### Manual Docker Build

If you want to build manually:

```bash
# Build the image
docker build -t gymapp-fe .

# Run it
docker run -d \
  --name gymapp-frontend \
  -p 3002:3002 \
  -e NODE_ENV=production \
  gymapp-fe

# View logs
docker logs -f gymapp-frontend
```

### Alternative: Build on Your Machine, Deploy to VPS

If Docker still has issues:

1. **Build locally:**
```bash
npm run build
```

2. **Copy `.next` directory to VPS:**
```bash
# From your laptop
scp -r .next deploy@mail:/srv/gymapp-fe/

# On VPS, start the app
cd /srv/gymapp-fe
npm start
```

### Troubleshooting

#### Container won't start
```bash
# Check logs
docker logs gymapp-frontend

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

#### Still getting lightningcss errors
Use the alternative Dockerfile:
```bash
docker build -f Dockerfile.alternative -t gymapp-fe .
docker run -d --name gymapp-frontend -p 3002:3002 gymapp-fe
```

#### Permission issues
```bash
sudo usermod -aG docker $USER
# Log out and back in
```

### Files Created

1. **`Dockerfile`** - Enhanced with lightningcss fix (multiple strategies)
2. **`Dockerfile.alternative`** - Backup option without standalone mode
3. **`deploy.sh`** - Automated deployment script
4. **`docker-compose.yml`** - Container orchestration
5. **`VPS_DEPLOYMENT.md`** - This guide

### Environment Variables

Make sure your `.env` file is on the VPS:
```bash
# On VPS
nano /srv/gymapp-fe/.env

# Add your environment variables:
# NODE_ENV=production
# PORT=3002
# etc...
```

### Nginx Reverse Proxy (Optional)

If you want to use a domain:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Monitoring

```bash
# View real-time logs
docker-compose logs -f

# Check container stats
docker stats gymapp-frontend

# Restart container
docker-compose restart

# Stop container
docker-compose down
```

### Update Process

To update your app:

```bash
cd /srv/gymapp-fe
git pull
./deploy.sh
# Or: docker-compose up -d --build
```

The container will be rebuilt with the latest changes.

### Success Checklist

- [ ] Docker is installed on VPS
- [ ] Container builds successfully
- [ ] Container starts without errors
- [ ] App responds at http://vps-ip:3002
- [ ] No lightningcss errors in logs
- [ ] Health check passes

### Need Help?

If issues persist:
1. Check logs: `docker-compose logs -f`
2. Check container: `docker ps -a`
3. Inspect container: `docker inspect gymapp-frontend`
4. Use alternative: `docker-compose -f docker-compose.yml build -- -f Dockerfile.alternative`

