# Docker Container Restart Loop Fix

## Issue
Container was restarting continuously with exit code 2, indicating a runtime error.

## Root Causes Fixed

1. **Startup Script Syntax Error**: The startup script had a malformed echo command with missing closing quote
2. **Missing HOSTNAME Environment Variable**: HOSTNAME wasn't set in Dockerfile ENV, only in docker-compose.yml
3. **Insufficient Error Logging**: Limited diagnostic information on startup

## Changes Made

### Dockerfile Updates:
1. Fixed startup script syntax using heredoc instead of echo with escaped newlines
2. Added `ENV HOSTNAME=0.0.0.0` to ensure server binds to all interfaces
3. Added comprehensive directory verification before starting server
4. Added explicit export of environment variables in startup script
5. Improved error messages and diagnostic output

## How to Deploy the Fix

### 1. Rebuild the Container
```bash
cd /srv/gymapp-fe
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 2. Check Logs
```bash
# View real-time logs
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# View logs for specific container
docker logs gymapp-frontend -f
```

### 3. Verify Container Status
```bash
# Check container status
docker ps -a

# Should show "Up" status, not "Restarting"
```

## What to Look For in Logs

The startup script now outputs detailed information:
- Working directory
- Port and Hostname configuration
- Node version
- Verification of required files and directories
- Any error messages before the server starts

### Expected Successful Output:
```
=== Starting Next.js Application ===
Working directory: /app
Port: 3002
Hostname: 0.0.0.0
Node version: v20.x.x
NODE_ENV: production

Checking for server.js...
✓ server.js found

Verifying required directories exist...
✓ .next/static exists
✓ public exists
✓ node_modules exists

Starting server on 0.0.0.0:3002...
```

## If Container Still Restarts

### Check the Actual Error:
```bash
# Get the last error before restart
docker logs gymapp-frontend --tail=50

# Check exit code
docker inspect gymapp-frontend | grep -A 10 "State"
```

### Common Issues and Solutions:

1. **Missing Environment Variables**
   - Check if your app requires specific env vars
   - Add them to docker-compose.yml environment section

2. **Port Already in Use**
   ```bash
   # Check if port 3002 is already in use
   sudo netstat -tulpn | grep 3002
   # Or
   sudo lsof -i :3002
   ```

3. **Permission Issues**
   ```bash
   # Check file permissions in container
   docker exec gymapp-frontend ls -la /app
   ```

4. **Missing Dependencies**
   - Verify standalone build includes all dependencies
   - Check if any native modules are missing

5. **Build Issues**
   ```bash
   # Rebuild from scratch
   docker-compose down
   docker system prune -af
   docker-compose build --no-cache
   docker-compose up -d
   ```

## Testing the Fix

After deploying, verify:

1. **Container is running:**
   ```bash
   docker ps | grep gymapp-frontend
   # Should show "Up" status
   ```

2. **Application responds:**
   ```bash
   curl http://localhost:3002
   # Or visit http://your-server-ip:3002
   ```

3. **No restart loop:**
   ```bash
   # Watch for a minute - status should remain "Up"
   watch -n 5 'docker ps | grep gymapp-frontend'
   ```

## Additional Debugging

If issues persist, run container interactively:
```bash
docker-compose down
docker-compose run --rm gymapp-fe /bin/sh
# Then manually run: /app/start.sh
# Or: node server.js
```

This will show you the exact error message.

