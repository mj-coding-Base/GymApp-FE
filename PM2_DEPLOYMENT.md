# PM2 Deployment Guide

This guide explains how to deploy the Next.js frontend application using PM2 process manager.

## Prerequisites

1. **Node.js 20+** installed on your VPS
2. **PM2** installed globally: `npm install -g pm2`
3. **Git** for pulling code updates
4. **Build tools** (if needed): `apt-get install -y python3 make g++`

## Initial Setup

### 1. Install PM2 (if not already installed)

```bash
npm install -g pm2
```

### 2. Create logs directory

```bash
cd /srv/gymapp-fe
mkdir -p logs
```

### 3. Install dependencies and build

```bash
cd /srv/gymapp-fe
npm install --legacy-peer-deps
npm run fix-lightningcss
npm run fix-native-binaries
npm run build
```

## Deployment Steps

### Option 1: Using PM2 Ecosystem File (Recommended)

```bash
cd /srv/gymapp-fe

# Pull latest code
git pull

# Install/update dependencies
npm install --legacy-peer-deps

# Fix native binaries
npm run fix-lightningcss
npm run fix-native-binaries

# Build the application
npm run build

# Start/restart with PM2
pm2 start ecosystem.config.cjs --env production

# Save PM2 process list (so it restarts on server reboot)
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions it provides
```

### Option 2: Direct PM2 Start

```bash
cd /srv/gymapp-fe
pm2 start npm --name "gymapp-fe" -- start
pm2 save
pm2 startup
```

## PM2 Commands

### Basic Commands

```bash
# Start the app
pm2 start ecosystem.config.cjs --env production

# Stop the app
pm2 stop gymapp-fe

# Restart the app
pm2 restart gymapp-fe

# Delete the app from PM2
pm2 delete gymapp-fe

# View status
pm2 status

# View logs
pm2 logs gymapp-fe

# View real-time logs
pm2 logs gymapp-fe --lines 100

# Monitor resources
pm2 monit
```

### Advanced Commands

```bash
# Reload app (zero-downtime restart)
pm2 reload gymapp-fe

# Restart with update environment
pm2 restart gymapp-fe --update-env

# View detailed info
pm2 show gymapp-fe

# View process list as JSON
pm2 jlist

# Save current process list
pm2 save

# Delete saved process list
pm2 kill
```

## Updating the Application

### Quick Update Script

Create `update.sh`:

```bash
#!/bin/bash
set -e

cd /srv/gymapp-fe

echo "📥 Pulling latest changes..."
git pull

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔧 Fixing native binaries..."
npm run fix-lightningcss
npm run fix-native-binaries

echo "🏗️  Building application..."
npm run build

echo "🔄 Reloading PM2..."
pm2 reload gymapp-fe

echo "✅ Update complete!"
pm2 status
```

Make it executable:
```bash
chmod +x update.sh
./update.sh
```

## Environment Variables

### Using .env file

The app automatically loads `.env` file. Make sure it exists:

```bash
cd /srv/gymapp-fe
nano .env
```

Example `.env`:
```env
NODE_ENV=production
PORT=3002
NEXT_PUBLIC_API_URL=https://your-api-domain.com
# Add other environment variables
```

### Using PM2 env

You can also set environment variables in `ecosystem.config.cjs`:

```javascript
env_production: {
  NODE_ENV: 'production',
  PORT: 3002,
  NEXT_PUBLIC_API_URL: 'https://your-api-domain.com',
}
```

## Monitoring & Logs

### View Logs

```bash
# All logs
pm2 logs gymapp-fe

# Error logs only
pm2 logs gymapp-fe --err

# Output logs only
pm2 logs gymapp-fe --out

# Last 100 lines
pm2 logs gymapp-fe --lines 100

# Clear logs
pm2 flush gymapp-fe
```

### Log Files Location

- Error logs: `./logs/pm2-error.log`
- Output logs: `./logs/pm2-out.log`
- Combined logs: `./logs/pm2-combined.log`

### Monitor Resources

```bash
# Real-time monitoring
pm2 monit

# Or use built-in monitoring
pm2 status
```

## Auto-Start on Server Reboot

### Setup PM2 Startup Script

```bash
pm2 startup
```

This will output a command like:
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
```

Run that command, then:
```bash
pm2 save
```

Now PM2 will automatically start your app when the server reboots.

## Troubleshooting

### App won't start

```bash
# Check PM2 logs
pm2 logs gymapp-fe --lines 50

# Check if port is in use
netstat -tulpn | grep 3002
# or
lsof -i :3002

# Check Node.js version
node -v  # Should be 20+

# Check if build exists
ls -la .next/
```

### App crashes frequently

```bash
# Check error logs
pm2 logs gymapp-fe --err --lines 100

# Check memory usage
pm2 monit

# View restart count
pm2 show gymapp-fe
```

### Port already in use

```bash
# Find process using port 3002
lsof -i :3002

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3003
```

### Native binary errors

```bash
# Reinstall and fix binaries
npm run fix-lightningcss
npm run fix-native-binaries

# Rebuild
npm run build

# Restart PM2
pm2 restart gymapp-fe
```

## Performance Tuning

### Memory Limits

Edit `ecosystem.config.cjs`:

```javascript
max_memory_restart: '1G', // Adjust based on your server
```

### Multiple Instances (Not Recommended for Next.js)

Next.js handles clustering internally, so running multiple PM2 instances is usually not needed. However, if you want to:

```javascript
instances: 2, // Number of instances
exec_mode: 'cluster', // Use cluster mode
```

**Note:** Next.js standalone mode works best with a single instance.

## Comparison: PM2 vs Docker

### PM2 Advantages
- ✅ Simpler setup (no Docker required)
- ✅ Faster startup time
- ✅ Easier debugging (direct access to logs)
- ✅ Lower resource overhead
- ✅ Native Node.js performance

### Docker Advantages
- ✅ Better isolation
- ✅ Easier dependency management
- ✅ Consistent environments
- ✅ Better for microservices

## Quick Reference

```bash
# Start
pm2 start ecosystem.config.cjs --env production

# Stop
pm2 stop gymapp-fe

# Restart
pm2 restart gymapp-fe

# Reload (zero-downtime)
pm2 reload gymapp-fe

# Logs
pm2 logs gymapp-fe

# Status
pm2 status

# Monitor
pm2 monit

# Save
pm2 save

# Startup
pm2 startup
```

## Security Notes

1. **Run as non-root user**: Create a dedicated user for the app
2. **Firewall**: Only expose necessary ports
3. **Environment variables**: Never commit `.env` files
4. **Logs**: Regularly rotate logs to prevent disk fill
5. **Updates**: Keep Node.js and dependencies updated

## Next Steps

1. Setup reverse proxy (Nginx) to handle SSL and routing
2. Configure log rotation
3. Setup monitoring (PM2 Plus, or external monitoring)
4. Configure backup strategy

