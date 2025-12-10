#!/bin/bash
# Quick workaround: Change port to 3004 to avoid conflict
# Run this on your VPS: ./CHANGE_PORT_QUICK.sh

set -e

echo "🔄 Changing port from 3002 to 3004..."

cd /srv/gymapp-fe

# Stop PM2
pm2 stop gymapp-fe 2>/dev/null || true
pm2 delete gymapp-fe 2>/dev/null || true

# Update .env file
if [ -f ".env" ]; then
    if grep -q "PORT=3002" .env; then
        sed -i 's/PORT=3002/PORT=3004/g' .env
        echo "✅ Updated .env: PORT=3004"
    else
        echo "PORT=3004" >> .env
        echo "✅ Added PORT=3004 to .env"
    fi
else
    echo "PORT=3004" > .env
    echo "✅ Created .env with PORT=3004"
fi

# Update ecosystem.config.cjs
if [ -f "ecosystem.config.cjs" ]; then
    sed -i 's/PORT: 3002/PORT: 3004/g' ecosystem.config.cjs
    echo "✅ Updated ecosystem.config.cjs: PORT=3004"
fi

# Start with new port
echo ""
echo "🚀 Starting with port 3004..."
pm2 start ecosystem.config.cjs --env production
pm2 save

echo ""
echo "✅ Port changed to 3004!"
echo ""
echo "📊 PM2 Status:"
pm2 status gymapp-fe

echo ""
echo "🌐 Your app is now on: http://localhost:3004"
echo "   Update your reverse proxy/nginx to point to port 3004"

