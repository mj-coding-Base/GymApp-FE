#!/bin/bash
# Fix Tailwind CSS not working with PM2 deployment
# Run this on your VPS: ./fix-tailwind-pm2.sh

set -e

echo "🔧 Fixing Tailwind CSS for PM2 deployment..."

cd /srv/gymapp-fe

# 1. Pull latest code (with next.config.ts fix)
echo "📥 Pulling latest code..."
git pull

# 2. Clean build
echo "🧹 Cleaning old build..."
rm -rf .next

# 3. Rebuild
echo "🏗️  Rebuilding application..."
npm run build

# 4. Verify CSS files exist
echo "🔍 Verifying CSS files..."
if [ -d ".next/static/css" ] && [ "$(ls -A .next/static/css 2>/dev/null)" ]; then
    echo "✅ CSS files found:"
    ls -lh .next/static/css/ | head -5
else
    echo "⚠️  WARNING: CSS files not found in .next/static/css/"
    echo "   This might indicate a build issue"
fi

# 5. Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart gymapp-fe

# 6. Wait a moment for app to start
sleep 3

# 7. Check status
echo ""
echo "📊 PM2 Status:"
pm2 status gymapp-fe

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Check browser console for CSS loading errors"
echo "  2. Verify CSS files are loading (Network tab in DevTools)"
echo "  3. Check PM2 logs: pm2 logs gymapp-fe"
echo ""
echo "🔍 To verify CSS is working:"
echo "  curl -I http://localhost:3002/_next/static/css/ | head -5"

