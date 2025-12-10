# Complete Port 3002 Fix Guide

## The Problem
Port 3002 is persistently occupied, preventing the app from starting. PM2 keeps trying to restart but fails.

## Solution Options

### Option 1: Force Fix (Recommended)
Use the aggressive fix script that will definitely kill the process:

```bash
cd /srv/gymapp-fe
git pull
chmod +x FORCE_FIX_PORT.sh
./FORCE_FIX_PORT.sh
```

This script will:
1. Stop PM2 auto-restart
2. Find and kill the process on port 3002
3. Verify port is free
4. Start PM2 fresh

### Option 2: Change Port (Quick Workaround)
If you can't free port 3002, change to port 3001:

```bash
cd /srv/gymapp-fe
git pull
chmod +x CHANGE_PORT_QUICK.sh
./CHANGE_PORT_QUICK.sh
```

### Option 3: Manual Nuclear Option
If scripts don't work, do this manually:

```bash
# 1. Kill PM2 completely
pm2 kill

# 2. Kill all node processes
pkill -9 node

# 3. Wait
sleep 5

# 4. Check what's on port 3002
lsof -i :3002
# OR
netstat -tulpn | grep :3002

# 5. If something is still there, kill it
# Replace <PID> with the actual PID from step 4
kill -9 <PID>

# 6. Verify port is free
lsof -i :3002
# Should show nothing

# 7. Restart PM2
pm2 resurrect 2>/dev/null || true

# 8. Start your app
cd /srv/gymapp-fe
pm2 start ecosystem.config.cjs --env production
pm2 save
```

### Option 4: Check for System Service
If port 3002 is used by a system service:

```bash
# Check if it's a systemd service
sudo systemctl list-units | grep 3002

# Check if it's in /etc/services
grep 3002 /etc/services

# Check if it's a Docker container
docker ps | grep 3002
```

## After Fixing

### Verify It's Working

```bash
# Check PM2 status
pm2 status

# Check if app is listening
netstat -tulpn | grep 3002
# OR if you changed port:
netstat -tulpn | grep 3001

# Test the app
curl http://localhost:3002
# OR if you changed port:
curl http://localhost:3001

# Check logs
pm2 logs gymapp-fe --lines 30
```

### If You Changed Port

Remember to update:
1. **Nginx/Reverse Proxy**: Update proxy_pass to new port
2. **Firewall**: Allow new port if needed
3. **Environment variables**: Update any references to port 3002

## Prevention

To avoid this in the future:

1. **Always use `pm2 stop` before `pm2 delete`**:
   ```bash
   pm2 stop gymapp-fe
   pm2 delete gymapp-fe
   ```

2. **Use `pm2 reload` for zero-downtime updates**:
   ```bash
   pm2 reload gymapp-fe
   ```

3. **Check port before starting**:
   ```bash
   lsof -i :3002
   # If something is there, kill it first
   ```

## Still Having Issues?

If nothing works, the port might be:
- Used by a system service
- Reserved by the kernel
- Used by another application

In this case, **change the port** using Option 2 above.

