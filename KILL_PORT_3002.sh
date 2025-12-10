#!/bin/bash
# Aggressive fix for port 3002 conflict
# Run this on your VPS: ./KILL_PORT_3002.sh

set -e

echo "🔍 Finding all processes using port 3002..."

# Method 1: Using lsof
if command -v lsof &> /dev/null; then
    echo "Using lsof to find processes..."
    PIDS=$(lsof -ti:3002 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
        echo "Found PIDs: $PIDS"
        for PID in $PIDS; do
            echo "Killing PID: $PID"
            kill -9 $PID 2>/dev/null || true
        done
    fi
fi

# Method 2: Using fuser
if command -v fuser &> /dev/null; then
    echo "Using fuser to find processes..."
    fuser -k 3002/tcp 2>/dev/null || true
fi

# Method 3: Using netstat and kill
if command -v netstat &> /dev/null; then
    echo "Using netstat to find processes..."
    NETSTAT_PIDS=$(netstat -tulpn 2>/dev/null | grep :3002 | awk '{print $7}' | cut -d'/' -f1 | grep -v '-' | sort -u)
    if [ -n "$NETSTAT_PIDS" ]; then
        for PID in $NETSTAT_PIDS; do
            if [ "$PID" != "-" ] && [ -n "$PID" ]; then
                echo "Killing PID from netstat: $PID"
                kill -9 $PID 2>/dev/null || true
            fi
        done
    fi
fi

# Method 4: Using ss
if command -v ss &> /dev/null; then
    echo "Using ss to find processes..."
    SS_PIDS=$(ss -tulpn 2>/dev/null | grep :3002 | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2 | cut -d')' -f1 | sort -u)
    if [ -n "$SS_PIDS" ]; then
        for PID in $SS_PIDS; do
            if [ "$PID" != "-" ] && [ -n "$PID" ] && [ "$PID" != "users" ]; then
                echo "Killing PID from ss: $PID"
                kill -9 $PID 2>/dev/null || true
            fi
        done
    fi
fi

# Stop all PM2 processes that might be using the port
echo "Stopping all PM2 processes..."
pm2 stop all 2>/dev/null || true
pm2 delete gymapp-fe 2>/dev/null || true

# Wait for processes to die
echo "Waiting for processes to terminate..."
sleep 5

# Final check and kill
if command -v lsof &> /dev/null; then
    REMAINING=$(lsof -ti:3002 2>/dev/null || true)
    if [ -n "$REMAINING" ]; then
        echo "Force killing remaining processes: $REMAINING"
        kill -9 $REMAINING 2>/dev/null || true
        sleep 2
    fi
fi

# Verify port is free
echo "Verifying port 3002 is free..."
if command -v lsof &> /dev/null; then
    if lsof -ti:3002 >/dev/null 2>&1; then
        echo "❌ Port 3002 is still in use!"
        echo "Remaining processes:"
        lsof -i:3002
        exit 1
    else
        echo "✅ Port 3002 is now free!"
    fi
else
    if netstat -tulpn 2>/dev/null | grep -q :3002; then
        echo "❌ Port 3002 is still in use!"
        netstat -tulpn | grep :3002
        exit 1
    else
        echo "✅ Port 3002 appears to be free!"
    fi
fi

# Start PM2 fresh
echo ""
echo "🚀 Starting PM2..."
cd /srv/gymapp-fe
pm2 start ecosystem.config.cjs --env production
pm2 save

echo ""
echo "✅ Fix complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 Check logs:"
echo "  pm2 logs gymapp-fe --lines 30"

