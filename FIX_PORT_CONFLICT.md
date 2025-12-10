# Fix Port 3002 Already in Use Error

## Problem
```
Error: listen EADDRINUSE: address already in use :::3002
```

This means port 3002 is already being used by another process.

## Quick Fix

Run these commands on your VPS:

```bash
cd /srv/gymapp-fe

# 1. Find what's using port 3002
lsof -i :3002
# OR
netstat -tulpn | grep :3002

# 2. Stop PM2 process properly
pm2 stop gymapp-fe
pm2 delete gymapp-fe

# 3. Kill any process still using port 3002
kill -9 $(lsof -ti:3002) 2>/dev/null || true

# 4. Wait a moment
sleep 2

# 5. Verify port is free
lsof -i :3002
# Should show nothing

# 6. Start PM2 again
pm2 start ecosystem.config.cjs --env production
pm2 save

# 7. Check status
pm2 status
pm2 logs gymapp-fe --lines 20
```

## Or Use the Fix Script

```bash
cd /srv/gymapp-fe
chmod +x fix-port-conflict.sh
./fix-port-conflict.sh
```

## Common Causes

1. **Old PM2 process didn't stop properly**: PM2 restart sometimes leaves the old process running
2. **Multiple PM2 instances**: Another PM2 process is using the port
3. **Manual process**: Someone started the app manually (not via PM2)
4. **Docker container**: A Docker container might be using the port

## Prevention

Always use PM2 commands to manage the app:

```bash
# Stop (graceful)
pm2 stop gymapp-fe

# Delete (remove from PM2)
pm2 delete gymapp-fe

# Then start fresh
pm2 start ecosystem.config.cjs --env production
```

Avoid using `pm2 restart` if you're having port conflicts - use `stop` then `start` instead.

## Alternative: Change Port

If you can't free port 3002, change it:

1. Edit `.env` file:
```bash
cd /srv/gymapp-fe
nano .env
# Change: PORT=3002 to PORT=3002
```

2. Update `ecosystem.config.cjs`:
```javascript
env_production: {
  NODE_ENV: 'production',
  PORT: 3002,  // Changed from 3002
},
```

3. Restart PM2:
```bash
pm2 delete gymapp-fe
pm2 start ecosystem.config.cjs --env production
pm2 save
```

