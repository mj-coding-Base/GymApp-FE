#!/bin/bash
# Fix port 3002 conflict issue
# Run this on your VPS: ./fix-port-conflict.sh

set -e

echo "🔍 Checking what's using port 3002..."

# Find process using port 3002
PORT_PID=$(lsof -ti:3002 2>/dev/null || netstat -tulpn 2>/dev/null | grep :3002 | awk '{print $7}' | cut -d'/' -f1 | head -1)

if [ -n "$PORT_PID" ]; then
    echo "⚠️  Found process using port 3002: PID $PORT_PID"
    
    # Check if it's a PM2 process
    if pm2 list | grep -q "$PORT_PID"; then
        echo "📋 This is a PM2 process. Stopping all PM2 processes on port 3002..."
        pm2 stop gymapp-fe 2>/dev/null || true
        pm2 delete gymapp-fe 2>/dev/null || true
        sleep 2
    else
        echo "⚠️  This is not a PM2 process. Killing it..."
        kill -9 $PORT_PID 2>/dev/null || true
        sleep 2
    fi
else
    echo "✅ Port 3002 appears to be free"
fi

# Double check
if lsof -ti:3002 >/dev/null 2>&1; then
    echo "⚠️  Port 3002 is still in use. Force killing..."
    kill -9 $(lsof -ti:3002) 2>/dev/null || true
    sleep 2
fi

# Verify port is free
if ! lsof -ti:3002 >/dev/null 2>&1; then
    echo "✅ Port 3002 is now free"
    
    # Start PM2
    echo "🚀 Starting PM2..."
    cd /srv/gymapp-fe
    pm2 start ecosystem.config.cjs --env production
    pm2 save
    
    echo ""
    echo "✅ Fix complete!"
    echo ""
    echo "📊 PM2 Status:"
    pm2 status gymapp-fe
else
    echo "❌ Failed to free port 3002"
    echo "   Please manually check: lsof -i :3002"
    exit 1
fi

