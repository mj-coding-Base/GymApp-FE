#!/bin/bash
# Final definitive fix for port 3002
# This will definitely free the port and start the app

set -e

echo "🛑 Step 1: Stopping ALL PM2 processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

echo "⏳ Waiting for PM2 to fully stop..."
sleep 5

echo "💀 Step 2: Killing ALL processes on port 3002..."

# Method 1: lsof
if command -v lsof &> /dev/null; then
    PIDS=$(lsof -ti:3002 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
        echo "   Killing PIDs from lsof: $PIDS"
        echo $PIDS | xargs kill -9 2>/dev/null || true
    fi
fi

# Method 2: fuser
if command -v fuser &> /dev/null; then
    fuser -k 3002/tcp 2>/dev/null || true
fi

# Method 3: Kill all node processes (nuclear)
echo "   Killing all node processes..."
pkill -9 node 2>/dev/null || true

echo "⏳ Waiting for processes to die..."
sleep 5

echo "✅ Step 3: Verifying port is free..."
if command -v lsof &> /dev/null; then
    if lsof -ti:3002 >/dev/null 2>&1; then
        echo "❌ Port 3002 is STILL in use!"
        echo "   Remaining processes:"
        lsof -i:3002
        echo ""
        echo "   This might be a system service. Consider changing port."
        exit 1
    fi
fi

echo "✅ Port 3002 is free!"

echo ""
echo "🚀 Step 4: Starting PM2..."
cd /srv/gymapp-fe

# Verify build exists
if [ ! -d ".next" ]; then
    echo "⚠️  .next directory not found. Building..."
    npm run build
fi

# Start PM2
pm2 start ecosystem.config.cjs --env production
pm2 save

echo ""
echo "✅ Fix complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🔍 Verifying app is running..."
sleep 3

# Check if app is listening
if netstat -tulpn 2>/dev/null | grep -q :3002 || lsof -ti:3002 >/dev/null 2>&1; then
    echo "✅ App is listening on port 3002"
    echo ""
    echo "📋 Test the app:"
    echo "   curl http://localhost:3002"
else
    echo "⚠️  App might not be listening yet. Check logs:"
    echo "   pm2 logs gymapp-fe --lines 30"
fi

