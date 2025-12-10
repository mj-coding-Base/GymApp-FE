#!/bin/bash
# Complete deployment fix - handles port conflict and verifies setup
# Run this on your VPS: ./COMPLETE_DEPLOYMENT_FIX.sh

set -e

echo "🔧 Complete PM2 Deployment Fix"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /srv/gymapp-fe

# Step 1: Fix port conflict
echo "1️⃣  Fixing port 3002 conflict..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
sleep 3

# Kill all processes on port 3002
if command -v lsof &> /dev/null; then
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
fi
pkill -9 node 2>/dev/null || true
sleep 3

# Verify port is free
if command -v lsof &> /dev/null; then
    if lsof -ti:3002 >/dev/null 2>&1; then
        echo "❌ Port 3002 still in use. Changing to port 3001..."
        # Update port in ecosystem.config.cjs
        sed -i 's/PORT: 3002/PORT: 3001/g' ecosystem.config.cjs
        if [ -f ".env" ]; then
            sed -i 's/PORT=3002/PORT=3001/g' .env || echo "PORT=3001" >> .env
        fi
        echo "✅ Port changed to 3001"
    else
        echo "✅ Port 3002 is free"
    fi
fi

# Step 2: Verify build
echo ""
echo "2️⃣  Verifying build..."
if [ ! -d ".next" ] || [ ! -d ".next/static" ]; then
    echo "⚠️  Build not found. Building application..."
    npm install --legacy-peer-deps
    npm run build
else
    echo "✅ Build exists"
    
    # Check if static files exist
    if [ -d ".next/static/css" ] && [ "$(ls -A .next/static/css 2>/dev/null)" ]; then
        echo "✅ Static CSS files exist"
    else
        echo "⚠️  Static CSS files missing. Rebuilding..."
        npm run build
    fi
fi

# Step 3: Verify static files
echo ""
echo "3️⃣  Verifying static files..."
STATIC_COUNT=$(find .next/static -type f 2>/dev/null | wc -l)
if [ "$STATIC_COUNT" -gt 0 ]; then
    echo "✅ Found $STATIC_COUNT static files"
else
    echo "❌ No static files found! Rebuilding..."
    rm -rf .next
    npm run build
fi

# Step 4: Start PM2
echo ""
echo "4️⃣  Starting PM2..."
pm2 start ecosystem.config.cjs --env production
pm2 save

# Step 5: Wait and verify
echo ""
echo "5️⃣  Verifying deployment..."
sleep 5

# Check PM2 status
if pm2 list | grep -q "gymapp-fe.*online"; then
    echo "✅ PM2 shows app as online"
else
    echo "⚠️  PM2 shows app as not online. Check logs:"
    pm2 logs gymapp-fe --lines 20
    exit 1
fi

# Check if app is listening
APP_PORT=$(grep -o "PORT: [0-9]*" ecosystem.config.cjs | grep -o "[0-9]*" | head -1)
if netstat -tulpn 2>/dev/null | grep -q ":$APP_PORT " || lsof -ti:$APP_PORT >/dev/null 2>&1; then
    echo "✅ App is listening on port $APP_PORT"
else
    echo "⚠️  App might not be listening. Check logs:"
    pm2 logs gymapp-fe --lines 20
fi

# Test local connection
echo ""
echo "6️⃣  Testing local connection..."
if curl -f http://localhost:$APP_PORT >/dev/null 2>&1; then
    echo "✅ App responds locally"
else
    echo "⚠️  App not responding locally. Check logs:"
    pm2 logs gymapp-fe --lines 30
fi

# Test static file
echo ""
echo "7️⃣  Testing static file serving..."
STATIC_FILE=$(find .next/static -name "*.js" -type f 2>/dev/null | head -1)
if [ -n "$STATIC_FILE" ]; then
    REL_PATH=$(echo $STATIC_FILE | sed 's|.*\.next/||')
    if curl -f "http://localhost:$APP_PORT/_next/$REL_PATH" >/dev/null 2>&1; then
        echo "✅ Static files are being served"
    else
        echo "⚠️  Static files not accessible via HTTP"
        echo "   This might be an Nginx configuration issue"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment fix complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 Next Steps:"
echo "   1. Check Nginx configuration (see NGINX_NEXTJS_CONFIG.md)"
echo "   2. Verify static files are accessible:"
echo "      curl http://localhost:$APP_PORT/_next/static/chunks/framework-*.js"
echo "   3. Check PM2 logs: pm2 logs gymapp-fe"
echo ""
echo "🌐 If using Nginx, make sure it's configured to proxy to port $APP_PORT"

