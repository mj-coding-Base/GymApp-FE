#!/bin/bash
# Quick fix script for lightningcss on VPS

set -e

echo "🔧 Fixing lightningcss on VPS..."
echo ""

cd /srv/gymapp-fe

# Step 1: Pull latest code (with new fix script)
echo "📥 Pulling latest code..."
git pull

# Step 2: Install dependencies with optional packages
echo ""
echo "📦 Installing dependencies with optional packages..."
npm install --legacy-peer-deps --include=optional

# Step 3: Run fix script
echo ""
echo "🔧 Running lightningcss fix script..."
npm run fix-lightningcss

# Step 4: Verify binary exists
echo ""
echo "✅ Verifying binary..."
if [ -f "node_modules/lightningcss/lightningcss.linux-x64-gnu.node" ]; then
    ls -lh node_modules/lightningcss/lightningcss.linux-x64-gnu.node
    echo "✅ Binary found!"
else
    echo "❌ ERROR: Binary still not found!"
    echo ""
    echo "Trying manual fix..."
    
    # Manual fix
    BINARY_PATH=$(find node_modules/lightningcss -name "lightningcss.linux-x64-gnu.node" -type f 2>/dev/null | head -1)
    if [ -n "$BINARY_PATH" ]; then
        echo "Found binary at: $BINARY_PATH"
        cp "$BINARY_PATH" node_modules/lightningcss/lightningcss.linux-x64-gnu.node
        chmod +x node_modules/lightningcss/lightningcss.linux-x64-gnu.node
        echo "✅ Manually copied binary"
    else
        echo "❌ Binary not found anywhere!"
        echo "Try: cd node_modules/lightningcss && npm install --include=optional"
        exit 1
    fi
fi

# Step 5: Build
echo ""
echo "🔨 Building application..."
npm run build

echo ""
echo "✅ All done! Build should be successful."

