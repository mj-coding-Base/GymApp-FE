# VPS Deployment Fix Guide

## Issue: Container Restarting (Exit Code 137) - No Port Binding

Exit code 137 = SIGKILL, typically caused by:
1. **Out of Memory (OOM)** - Most common cause
2. Container crashes before binding to port
3. Missing server.js file
4. Network binding issues

## Fixes Applied

### 1. Dockerfile Improvements
- ✅ Added startup script with error checking
- ✅ Verify server.js exists before starting
- ✅ Better error messages and logging
- ✅ Health check with longer startup period (40s)

### 2. Docker Compose Improvements
- ✅ Increased memory limit from 2G to 3G (prevents OOM)
- ✅ Added `HOSTNAME=0.0.0.0` to bind to all interfaces
- ✅ Added `init: true` for proper signal handling
- ✅ Added `stop_grace_period: 30s` for graceful shutdown

## Deployment Steps

### Step 1: Rebuild the Container
```bash
cd /srv/gymapp-fe

# Stop and remove existing container
docker compose down

# Remove old image to force rebuild
docker rmi gymapp-fe-gymapp-fe 2>/dev/null || true

# Clear build cache
docker builder prune -f

# Rebuild with no cache
docker compose build --no-cache
```

### Step 2: Check Build Output
```bash
# Verify the build completed successfully
# Look for: "✓ server.js found, build successful"
```

### Step 3: Start the Container
```bash
docker compose up -d
```

### Step 4: Check Container Status
```bash
# Check if container is running (not restarting)
docker ps

# Check logs for errors
docker logs gymapp-frontend

# Follow logs in real-time
docker logs -f gymapp-frontend
```

### Step 5: Verify Port Binding
```bash
# Check if port 3002 is listening
netstat -tlnp | grep 3002
# OR
ss -tlnp | grep 3002

# Test from inside container
docker exec gymapp-frontend netstat -tlnp | grep 3002
```

## Troubleshooting

### If Container Still Restarts

#### Check Logs
```bash
# Get last 100 lines of logs
docker logs --tail 100 gymapp-frontend

# Check for specific errors
docker logs gymapp-frontend 2>&1 | grep -i error
```

#### Check System Resources
```bash
# Check available memory
free -h

# Check if OOM killer is involved
dmesg | grep -i "out of memory"
dmesg | grep -i "killed process"

# Check Docker stats
docker stats gymapp-frontend --no-stream
```

#### Verify server.js Exists
```bash
# Check if server.js exists in container
docker exec gymapp-frontend ls -la /app/server.js

# Check directory structure
docker exec gymapp-frontend ls -la /app/
```

#### Check Port Conflicts
```bash
# Check if port 3002 is already in use
sudo lsof -i :3002
# OR
sudo netstat -tlnp | grep 3002
```

### If Memory Issues Persist

#### Option 1: Increase Memory Limit
Edit `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      memory: 4G  # Increase further if needed
```

#### Option 2: Add Swap Space (if VPS allows)
```bash
# Check current swap
free -h

# Add swap (example for 2GB swap)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### If server.js is Missing

This means the standalone build failed. Check:

1. **Build logs** - Look for errors during `npm run build`
2. **next.config.ts** - Ensure `output: 'standalone'` is set
3. **Build stage** - Check if `.next/standalone` directory was created

```bash
# Rebuild and check build output
docker compose build --progress=plain 2>&1 | tee build.log

# Search for errors
grep -i error build.log
```

## Expected Behavior After Fix

1. ✅ Container status: `Up` (not `Restarting`)
2. ✅ Port mapping visible: `0.0.0.0:3002->3002/tcp`
3. ✅ Health check: `(healthy)` after ~40 seconds
4. ✅ Logs show: "Starting server on port 3002..."
5. ✅ Application accessible at `http://your-vps-ip:3002`

## Verification Commands

```bash
# 1. Check container status
docker ps | grep gymapp-frontend

# 2. Check port binding
docker port gymapp-frontend

# 3. Test HTTP endpoint
curl http://localhost:3002

# 4. Check health
docker inspect gymapp-frontend | grep -A 10 Health
```

## Additional Notes

- **Memory**: Next.js standalone builds need at least 1.5GB RAM to run
- **Startup Time**: Allow 30-60 seconds for initial startup
- **Health Check**: Container shows as healthy after 40 seconds
- **Logs**: Always check logs first when troubleshooting

## Quick Fix Script

```bash
#!/bin/bash
# Quick fix script for VPS deployment

cd /srv/gymapp-fe

echo "Stopping containers..."
docker compose down

echo "Cleaning up..."
docker builder prune -f
docker rmi gymapp-fe-gymapp-fe 2>/dev/null || true

echo "Rebuilding..."
docker compose build --no-cache

echo "Starting containers..."
docker compose up -d

echo "Waiting for startup..."
sleep 10

echo "Checking status..."
docker ps | grep gymapp-frontend

echo "Checking logs..."
docker logs --tail 20 gymapp-frontend

echo "Done! Check the output above for any errors."
```

Save as `fix-deployment.sh`, make executable (`chmod +x fix-deployment.sh`), and run it.


