#!/bin/bash
# Force fix for port 3002 - stops auto-restart, kills process, starts fresh
# Run this on your VPS: ./FORCE_FIX_PORT.sh

set -e

echo "🛑 Step 1: Stopping PM2 auto-restart..."
cd /srv/gymapp-fe

# Stop the app and disable auto-restart
pm2 stop gymapp-fe 2>/dev/null || true
pm2 delete gymapp-fe 2>/dev/null || true

# Disable PM2 auto-restart temporarily
pm2 set pm2:autodump false 2>/dev/null || true

echo "🔍 Step 2: Finding process using port 3002..."

# Find process using port 3002
PORT_PID=""

# Try lsof
if command -v lsof &> /dev/null; then
    PORT_PID=$(lsof -ti:3002 2>/dev/null || true)
    if [ -n "$PORT_PID" ]; then
        echo "Found PID using lsof: $PORT_PID"
    fi
fi

# Try netstat if lsof didn't work
if [ -z "$PORT_PID" ] && command -v netstat &> /dev/null; then
    PORT_PID=$(netstat -tulpn 2>/dev/null | grep :3002 | awk '{print $7}' | cut -d'/' -f1 | head -1)
    if [ -n "$PORT_PID" ] && [ "$PORT_PID" != "-" ]; then
        echo "Found PID using netstat: $PORT_PID"
    else
        PORT_PID=""
    fi
fi

# Try ss if still nothing
if [ -z "$PORT_PID" ] && command -v ss &> /dev/null; then
    PORT_PID=$(ss -tulpn 2>/dev/null | grep :3002 | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2 | cut -d')' -f1 | head -1)
    if [ -n "$PORT_PID" ] && [ "$PORT_PID" != "-" ] && [ "$PORT_PID" != "users" ]; then
        echo "Found PID using ss: $PORT_PID"
    else
        PORT_PID=""
    fi
fi

echo "💀 Step 3: Killing process on port 3002..."

if [ -n "$PORT_PID" ]; then
    echo "Killing PID: $PORT_PID"
    kill -9 $PORT_PID 2>/dev/null || true
    sleep 2
fi

# Also try fuser
if command -v fuser &> /dev/null; then
    echo "Using fuser to kill port 3002..."
    fuser -k 3002/tcp 2>/dev/null || true
    sleep 2
fi

# Kill all processes on port 3002 using lsof
if command -v lsof &> /dev/null; then
    ALL_PIDS=$(lsof -ti:3002 2>/dev/null || true)
    if [ -n "$ALL_PIDS" ]; then
        echo "Killing all PIDs on port 3002: $ALL_PIDS"
        for PID in $ALL_PIDS; do
            kill -9 $PID 2>/dev/null || true
        done
        sleep 2
    fi
fi

echo "⏳ Step 4: Waiting for port to be released..."
sleep 5

echo "✅ Step 5: Verifying port is free..."

# Verify port is free
PORT_IN_USE=false

if command -v lsof &> /dev/null; then
    if lsof -ti:3002 >/dev/null 2>&1; then
        PORT_IN_USE=true
        echo "❌ Port 3002 is still in use!"
        lsof -i:3002
    fi
elif command -v netstat &> /dev/null; then
    if netstat -tulpn 2>/dev/null | grep -q :3002; then
        PORT_IN_USE=true
        echo "❌ Port 3002 is still in use!"
        netstat -tulpn | grep :3002
    fi
fi

if [ "$PORT_IN_USE" = true ]; then
    echo ""
    echo "⚠️  Port 3002 is still in use. Trying nuclear option..."
    echo "Killing all node processes..."
    pkill -9 node 2>/dev/null || true
    sleep 5
    
    # Check again
    if command -v lsof &> /dev/null; then
        if lsof -ti:3002 >/dev/null 2>&1; then
            echo "❌ Port 3002 STILL in use after killing all node processes!"
            echo "This might be a system service. Consider changing the port."
            exit 1
        fi
    fi
fi

echo "✅ Port 3002 is now free!"

echo ""
echo "🚀 Step 6: Starting PM2 fresh..."

# Re-enable PM2 auto-restart
pm2 set pm2:autodump true 2>/dev/null || true

# Start the app
pm2 start ecosystem.config.cjs --env production

# Wait a moment
sleep 3

# Save PM2 state
pm2 save

echo ""
echo "✅ Fix complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status gymapp-fe

echo ""
echo "📋 Check if it's working:"
echo "  pm2 logs gymapp-fe --lines 30"
echo "  curl http://localhost:3002"

