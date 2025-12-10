# Manual Fix for Port 3002 Conflict

## Step-by-Step Manual Fix

Run these commands **one by one** on your VPS:

### Step 1: Find what's using port 3002

```bash
# Try method 1 (most common)
lsof -i :3002

# If lsof not available, try method 2
netstat -tulpn | grep :3002

# Or method 3
ss -tulpn | grep :3002
```

### Step 2: Stop PM2 completely

```bash
# Stop all PM2 processes
pm2 stop all

# Delete the gymapp-fe process
pm2 delete gymapp-fe

# Kill PM2 daemon if needed (will restart automatically)
pm2 kill
```

### Step 3: Kill the process using port 3002

```bash
# If you found a PID from step 1, kill it:
kill -9 <PID>

# OR kill all processes on port 3002:
lsof -ti:3002 | xargs kill -9

# OR if lsof not available:
fuser -k 3002/tcp
```

### Step 4: Wait and verify

```bash
# Wait a few seconds
sleep 5

# Verify port is free
lsof -i :3002
# Should show nothing

# OR
netstat -tulpn | grep :3002
# Should show nothing
```

### Step 5: Start PM2 fresh

```bash
cd /srv/gymapp-fe

# Start PM2
pm2 start ecosystem.config.cjs --env production

# Save
pm2 save

# Check status
pm2 status
pm2 logs gymapp-fe --lines 30
```

## Nuclear Option (If Nothing Else Works)

```bash
# Kill ALL node processes (be careful!)
pkill -9 node

# Wait
sleep 3

# Kill PM2 daemon
pm2 kill

# Restart PM2
pm2 resurrect

# Start your app
cd /srv/gymapp-fe
pm2 start ecosystem.config.cjs --env production
pm2 save
```

## Alternative: Change Port

If you can't free port 3002, change to a different port:

```bash
cd /srv/gymapp-fe

# Edit .env
nano .env
# Change PORT=3002 to PORT=3001

# Edit ecosystem.config.cjs
nano ecosystem.config.cjs
# Change PORT: 3002 to PORT: 3001 in both env and env_production

# Start with new port
pm2 delete gymapp-fe
pm2 start ecosystem.config.cjs --env production
pm2 save
```

