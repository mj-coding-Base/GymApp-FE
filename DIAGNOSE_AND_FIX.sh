#!/bin/bash
# Complete diagnostic and fix script
# Run this on your VPS: ./DIAGNOSE_AND_FIX.sh

set -e

echo "🔍 Diagnosing deployment issues..."
echo ""

cd /srv/gymapp-fe

# Check 1: Port conflict
echo "1️⃣  Checking port 3002..."
if command -v lsof &> /dev/null; then
    PORT_PID=$(lsof -ti:3002 2>/dev/null || true)
    if [ -n "$PORT_PID" ]; then
        echo "   ❌ Port 3002 is in use by PID: $PORT_PID"
        echo "   Killing process..."
        kill -9 $PORT_PID 2>/dev/null || true
        pm2 stop all 2>/dev/null || true
        pm2 delete all 2>/dev/null || true
        pm2 kill 2>/dev/null || true
        pkill -9 node 2>/dev/null || true
        sleep 5
        echo "   ✅ Port should be free now"
    else
        echo "   ✅ Port 3002 is free"
    fi
else
    echo "   ⚠️  lsof not available, skipping port check"
fi

# Check 2: Build exists
echo ""
echo "2️⃣  Checking build..."
if [ ! -d ".next" ]; then
    echo "   ❌ .next directory not found!"
    echo "   Building application..."
    npm install --legacy-peer-deps
    npm run build
elif [ ! -d ".next/static" ]; then
    echo "   ❌ .next/static directory not found!"
    echo "   Rebuilding..."
    rm -rf .next
    npm run build
else
    echo "   ✅ Build exists"
    
    # Count static files
    STATIC_COUNT=$(find .next/static -type f 2>/dev/null | wc -l)
    echo "   ✅ Found $STATIC_COUNT static files"
    
    # Check for JS files
    JS_COUNT=$(find .next/static -name "*.js" -type f 2>/dev/null | wc -l)
    if [ "$JS_COUNT" -gt 0 ]; then
        echo "   ✅ Found $JS_COUNT JavaScript files"
    else
        echo "   ❌ No JavaScript files found! Rebuilding..."
        rm -rf .next
        npm run build
    fi
fi

# Check 3: PM2 status
echo ""
echo "3️⃣  Checking PM2..."
pm2 stop gymapp-fe 2>/dev/null || true
pm2 delete gymapp-fe 2>/dev/null || true

# Check 4: Start PM2
echo ""
echo "4️⃣  Starting PM2..."
pm2 start ecosystem.config.cjs --env production
pm2 save

# Wait for app to start
echo ""
echo "5️⃣  Waiting for app to start..."
sleep 5

# Check 6: Verify app is running
echo ""
echo "6️⃣  Verifying app..."
APP_PORT=$(grep "PORT:" ecosystem.config.cjs | grep -o "[0-9]*" | head -1)

if pm2 list | grep -q "gymapp-fe.*online"; then
    echo "   ✅ PM2 shows app as online"
else
    echo "   ❌ PM2 shows app as not online"
    echo "   Logs:"
    pm2 logs gymapp-fe --lines 20 --nostream
    exit 1
fi

# Check 7: Test local connection
echo ""
echo "7️⃣  Testing local connection..."
if curl -f -s http://localhost:$APP_PORT >/dev/null 2>&1; then
    echo "   ✅ App responds on http://localhost:$APP_PORT"
else
    echo "   ❌ App not responding locally"
    echo "   Logs:"
    pm2 logs gymapp-fe --lines 30 --nostream
    exit 1
fi

# Check 8: Test static file
echo ""
echo "8️⃣  Testing static file serving..."
STATIC_JS=$(find .next/static -name "*.js" -type f 2>/dev/null | head -1)
if [ -n "$STATIC_JS" ]; then
    REL_PATH=$(echo $STATIC_JS | sed 's|.*\.next/||')
    echo "   Testing: /_next/$REL_PATH"
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$APP_PORT/_next/$REL_PATH" 2>/dev/null || echo "000")
    CONTENT_TYPE=$(curl -s -I "http://localhost:$APP_PORT/_next/$REL_PATH" 2>/dev/null | grep -i "content-type" || echo "")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ Static file returns 200"
        if echo "$CONTENT_TYPE" | grep -qi "javascript\|application/json"; then
            echo "   ✅ Content-Type is correct: $CONTENT_TYPE"
        else
            echo "   ⚠️  Content-Type might be wrong: $CONTENT_TYPE"
            echo "      This is likely an Nginx configuration issue"
        fi
    else
        echo "   ❌ Static file returns $HTTP_CODE"
        echo "      File path: $REL_PATH"
        echo "      This might be a build or routing issue"
    fi
else
    echo "   ⚠️  No static JS files found to test"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ PM2 Status:"
pm2 status gymapp-fe

echo ""
echo "📋 Next Steps:"
echo "   1. If static files return 404 or wrong MIME type:"
echo "      - Check Nginx configuration (see NGINX_NEXTJS_CONFIG.md)"
echo "      - Verify Nginx is proxying to port $APP_PORT"
echo ""
echo "   2. Test static files directly:"
echo "      curl -I http://localhost:$APP_PORT/_next/static/chunks/framework-*.js"
echo ""
echo "   3. Check PM2 logs:"
echo "      pm2 logs gymapp-fe --lines 50"
echo ""
echo "   4. If Nginx is configured, reload it:"
echo "      sudo nginx -t && sudo systemctl reload nginx"

