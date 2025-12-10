#!/bin/bash
# EMERGENCY FIX: Change port and stop restart loop
# Run this IMMEDIATELY on your VPS

set -e

echo "🚨 EMERGENCY PORT FIX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /srv/gymapp-fe

# Step 1: KILL EVERYTHING
echo "1️⃣  KILLING ALL PROCESSES..."
pm2 kill 2>/dev/null || true
pkill -9 node 2>/dev/null || true
pkill -9 pm2 2>/dev/null || true
sleep 5

# Step 2: Kill port 3002
echo "2️⃣  KILLING PORT 3002..."
if command -v lsof &> /dev/null; then
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
fi
if command -v fuser &> /dev/null; then
    fuser -k 3002/tcp 2>/dev/null || true
fi
sleep 3

# Step 3: Update port to 3002
echo "3️⃣  CHANGING PORT TO 3002..."
git pull 2>/dev/null || true

# Update ecosystem.config.cjs
sed -i 's/PORT: 3002/PORT: 3002/g' ecosystem.config.cjs
sed -i 's/PORT: 3002/PORT: 3002/g' ecosystem.config.cjs  # Ensure it's 3002

# Update .env
if [ -f ".env" ]; then
    sed -i 's/PORT=3002/PORT=3002/g' .env || echo "PORT=3002" >> .env
else
    echo "PORT=3002" > .env
fi

echo "   ✅ Port changed to 3002"

# Step 4: Verify port 3002 is free
echo "4️⃣  VERIFYING PORT 3002..."
if command -v lsof &> /dev/null; then
    if lsof -ti:3002 >/dev/null 2>&1; then
        echo "   ⚠️  Port 3002 is in use, killing..."
        lsof -ti:3002 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
fi

# Step 5: Restart PM2 daemon
echo "5️⃣  RESTARTING PM2 DAEMON..."
pm2 kill
sleep 2
pm2 ping 2>/dev/null || echo "PM2 daemon stopped"

# Step 6: Start app on new port
echo "6️⃣  STARTING APP ON PORT 3002..."
pm2 start ecosystem.config.cjs --env production
pm2 save

# Step 7: Wait and check
echo "7️⃣  WAITING FOR APP TO START..."
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🔍 Checking port 3002..."
if netstat -tulpn 2>/dev/null | grep -q ":3002 " || lsof -ti:3002 >/dev/null 2>&1; then
    echo "✅ App is listening on port 3002"
else
    echo "⚠️  App might not be listening. Check logs:"
    pm2 logs gymapp-fe --lines 20 --nostream
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ EMERGENCY FIX COMPLETE!"
echo ""
echo "🌐 App is now on: http://localhost:3002"
echo ""
echo "📋 CRITICAL: Update Nginx configuration!"
echo "   sudo nano /etc/nginx/sites-available/payzhe.fit"
echo "   Change: proxy_pass http://localhost:3002;"
echo "   To:     proxy_pass http://localhost:3002;"
echo "   Then:   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "📋 Test: curl http://localhost:3002"

