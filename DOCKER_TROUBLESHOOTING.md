# Docker Build Troubleshooting Guide

## Error: "failed to solve: frontend grpc server closed unexpectedly"

This error typically occurs due to Docker BuildKit issues. Follow these steps in order:

### Step 1: Restart Docker Daemon
```bash
sudo systemctl restart docker
# Or if using Docker Desktop, restart the Docker Desktop application
```

### Step 2: Clear Docker BuildKit Cache
```bash
# Clear BuildKit cache
docker builder prune -af

# Clear all build cache
docker system prune -af --volumes
```

### Step 3: Try Building Without BuildKit
```bash
# Disable BuildKit temporarily
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

# Then build
docker compose build --no-cache
```

### Step 4: Check Docker Resources
```bash
# Check Docker system info
docker system df

# Check available disk space
df -h

# Check Docker daemon logs
sudo journalctl -u docker.service -n 50
```

### Step 5: Increase Docker Resources (if needed)
If you're running Docker Desktop or have resource limits:
- Increase allocated memory (at least 4GB recommended)
- Increase allocated disk space
- Increase CPU allocation

### Step 6: Build with Verbose Output
```bash
# Build with more verbose output to see where it fails
DOCKER_BUILDKIT=1 docker compose build --progress=plain --no-cache
```

### Step 7: Build Stage by Stage
If the above doesn't work, try building individual stages:
```bash
# Build just the deps stage
docker build --target deps -t gymapp-fe:deps .

# Build just the builder stage
docker build --target builder -t gymapp-fe:builder .

# Build the full image
docker build -t gymapp-fe:latest .
```

### Step 8: Check Network Connectivity
```bash
# Test Docker Hub connectivity
docker pull node:20-slim

# If behind a proxy, configure Docker proxy settings
```

### Step 9: Alternative: Use Legacy Builder
If BuildKit continues to fail, you can modify the Dockerfile to use legacy builder:
```dockerfile
# Remove or comment out the BuildKit syntax line
# # syntax=docker/dockerfile:1
```

### Step 10: Check System Resources
```bash
# Check available memory
free -h

# Check CPU usage
top

# Check disk I/O
iostat -x 1 5
```

## Quick Fix Commands (Run on VPS)

```bash
# 1. Restart Docker
sudo systemctl restart docker

# 2. Clear caches
docker builder prune -af
docker system prune -af

# 3. Try building without BuildKit
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker compose build --no-cache

# 4. If successful, start the container
docker compose up -d
```

## If All Else Fails

1. **Check Docker version compatibility:**
   ```bash
   docker --version
   docker compose version
   ```

2. **Update Docker if needed:**
   ```bash
   # On Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install docker.io docker-compose-plugin
   ```

3. **Check for Docker daemon errors:**
   ```bash
   sudo journalctl -u docker.service -f
   ```

4. **Try building on a different machine** to isolate if it's a VPS-specific issue

## Common Causes

1. **Insufficient memory** - Next.js builds require at least 2GB RAM
2. **Disk space** - Need at least 10GB free space
3. **Network issues** - Docker can't reach Docker Hub
4. **BuildKit bugs** - Known issues with certain Docker versions
5. **Corrupted cache** - BuildKit cache corruption

## Recommended Solution

For production VPS, I recommend:

1. Use the updated `docker-compose.yml` (version field removed)
2. Build with BuildKit disabled initially:
   ```bash
   DOCKER_BUILDKIT=0 docker compose build --no-cache
   ```
3. Once working, you can re-enable BuildKit for faster builds
