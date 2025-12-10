#!/bin/bash
# Change port to 3001 and fix deployment
# Run this on your VPS: ./CHANGE_PORT_AND_FIX.sh

set -e

echo "🔄 Changing port from 3002 to 3001 and fixing deployment..."
echo ""

cd /srv/gymapp-fe

# Step 1: Stop PM2 completely and disable auto-restart
echo "1️⃣  Stopping PM2 and disabling auto-restart..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
sleep 3

# Step 2: Kill ALL processes on port 3002
echo "2️⃣  Killing all processes on port 3002..."
if command -v lsof &> /dev/null; then
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
fi
pkill -9 node 2>/dev/null || true
sleep 3

# Step 3: Update port in ecosystem.config.cjs
echo "3️⃣  Updating port to 3001..."
if grep -q "PORT: 3002" ecosystem.config.cjs; then
    sed -i 's/PORT: 3002/PORT: 3001/g' ecosystem.config.cjs
    echo "   ✅ Updated ecosystem.config.cjs"
else
    echo "   ⚠️  Port already changed or not found"
fi

# Step 4: Update .env file
echo "4️⃣  Updating .env file..."
if [ -f ".env" ]; then
    if grep -q "PORT=3002" .env; then
        sed -i 's/PORT=3002/PORT=3001/g' .env
        echo "   ✅ Updated .env"
    else
        if ! grep -q "PORT=" .env; then
            echo "PORT=3001" >> .env
            echo "   ✅ Added PORT=3001 to .env"
        fi
    fi
else
    echo "PORT=3001" > .env
    echo "   ✅ Created .env with PORT=3001"
fi

# Step 5: Re-enable auto-restart in ecosystem.config.cjs
echo "5️⃣  Re-enabling auto-restart..."
sed -i 's/autorestart: false/autorestart: true/g' ecosystem.config.cjs

# Step 6: Verify build
echo "6️⃣  Verifying build..."
if [ ! -d ".next" ] || [ ! -d ".next/static" ]; then
    echo "   Building application..."
    npm install --legacy-peer-deps
    npm run build
else
    echo "   ✅ Build exists"
fi

# Step 7: Start PM2 with new port
echo "7️⃣  Starting PM2 on port 3001..."
pm2 start ecosystem.config.cjs --env production
pm2 save

# Step 8: Wait and verify
echo "8️⃣  Verifying deployment..."
sleep 5

if pm2 list | grep -q "gymapp-fe.*online"; then
    echo "   ✅ PM2 shows app as online"
else
    echo "   ⚠️  App might not be online. Check logs:"
    pm2 logs gymapp-fe --lines 20 --nostream
fi

# Check if app is listening on new port
if netstat -tulpn 2>/dev/null | grep -q ":3001 " || lsof -ti:3001 >/dev/null 2>&1; then
    echo "   ✅ App is listening on port 3001"
else
    echo "   ⚠️  App might not be listening. Check logs:"
    pm2 logs gymapp-fe --lines 30 --nostream
fi

# Test local connection
if curl -f -s http://localhost:3001 >/dev/null 2>&1; then
    echo "   ✅ App responds on http://localhost:3001"
else
    echo "   ⚠️  App not responding. Check logs:"
    pm2 logs gymapp-fe --lines 30 --nostream
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Port changed to 3001!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🌐 Your app is now on: http://localhost:3001"
echo ""
echo "📋 IMPORTANT: Update Nginx configuration!"
echo "   Change proxy_pass to: http://localhost:3001"
echo "   Then reload Nginx: sudo systemctl reload nginx"
echo ""
echo "📋 Test locally:"
echo "   curl http://localhost:3001"

