#!/bin/bash
# Manual fix for lightningcss binary on VPS

set -e

echo "🔧 Manual LightningCSS Binary Fix"
echo "================================="
echo ""

cd /srv/gymapp-fe

# Step 1: Check if lightningcss is installed
if [ ! -d "node_modules/lightningcss" ]; then
    echo "❌ lightningcss not installed!"
    echo "Installing lightningcss..."
    npm install lightningcss --legacy-peer-deps --include=optional
fi

echo ""
echo "📦 Step 1: Finding lightningcss binary..."
echo ""

# Find all .node files
BINARY_FOUND=$(find node_modules/lightningcss -name "*.node" -type f 2>/dev/null | head -1)

if [ -z "$BINARY_FOUND" ]; then
    echo "⚠️  No .node files found in lightningcss!"
    echo ""
    echo "Trying to reinstall lightningcss with optional dependencies..."
    npm install lightningcss --legacy-peer-deps --include=optional --force
    
    # Try again
    BINARY_FOUND=$(find node_modules/lightningcss -name "*.node" -type f 2>/dev/null | head -1)
fi

if [ -z "$BINARY_FOUND" ]; then
    echo ""
    echo "❌ ERROR: Still cannot find lightningcss binary!"
    echo ""
    echo "Checking lightningcss directory structure:"
    ls -la node_modules/lightningcss/ 2>/dev/null | head -20
    echo ""
    echo "Trying to install platform-specific package..."
    npm install --no-save lightningcss-linux-x64-gnu --legacy-peer-deps || true
    
    # Try one more time
    BINARY_FOUND=$(find node_modules/lightningcss -name "*.node" -type f 2>/dev/null | head -1)
fi

if [ -z "$BINARY_FOUND" ]; then
    echo ""
    echo "❌ CRITICAL: Cannot find lightningcss binary anywhere!"
    echo ""
    echo "Please use Docker instead:"
    echo "  export DOCKER_BUILDKIT=1"
    echo "  docker compose build"
    exit 1
fi

echo "✅ Found binary at: $BINARY_FOUND"
echo ""

# Step 2: Copy to expected location
DST="node_modules/lightningcss/lightningcss.linux-x64-gnu.node"
echo "📋 Step 2: Copying to expected location..."
echo "   From: $BINARY_FOUND"
echo "   To:   $DST"

# Ensure destination directory exists
mkdir -p "$(dirname "$DST")"

# Copy the binary
cp -v "$BINARY_FOUND" "$DST"
chmod +x "$DST"

echo ""
echo "✅ Step 3: Verifying..."
if [ -f "$DST" ]; then
    ls -lh "$DST"
    echo ""
    echo "✅ SUCCESS! lightningcss binary is now in place."
    echo ""
    echo "You can now run: npm run build"
else
    echo "❌ ERROR: Binary was not copied successfully!"
    exit 1
fi

