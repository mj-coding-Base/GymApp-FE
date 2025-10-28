# VPS Build Fix - LightningCSS Issue

## Problem
When building directly on VPS, you get:
```
Error: Cannot find module '../lightningcss.linux-x64-gnu.node'
```

## Root Cause
LightningCSS (dependency of Tailwind CSS v4) requires native binaries that need to be properly installed for the linux platform.

## Solution 1: Use Docker (Recommended)

The easiest and most reliable way to build on VPS is using Docker:

```bash
# On VPS
cd /srv/gymapp-fe

# Pull latest changes
git pull

# Build and run with Docker
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

## Solution 2: Fix Direct Build on VPS

If you prefer to build directly on VPS without Docker:

### Step 1: Clean Install with Correct Flags

```bash
cd /srv/gymapp-fe

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Install with flags to include optional dependencies
npm install --legacy-peer-deps --include=optional

# The postinstall script will automatically fix lightningcss
# Verify the binary exists:
ls -la node_modules/lightningcss/*.node

# Should show: lightningcss.linux-x64-gnu.node
```

### Step 2: Build

```bash
npm run build
```

The build script will:
1. Run the lightningcss fix (ensures binary is in right place)
2. Build the Next.js app

### Step 3: Start

```bash
npm start
```

## What Was Fixed

1. **Added postinstall script** to `package.json` - automatically fixes lightningcss after npm install
2. **Updated build script** to run the fix before building
3. **Simplified Dockerfile** - cleaner approach to fix lightningcss in Docker builds
4. **Added build tools** to Docker builder stage for native module compilation

## Testing Locally Before VPS

To test the fix locally (simulating VPS environment):

```bash
# Remove node_modules
rm -rf node_modules

# Reinstall
npm install --legacy-peer-deps --include=optional

# Build
npm run build

# Should build successfully now
```

## What Changed

### package.json
- Added `postinstall` script to fix lightningcss after install
- Updated `build` script to fix lightningcss before building
- Added inline `fix-lightningcss` script

### Dockerfile
- Simplified lightningcss fix logic
- Added build tools to builder stage
- More reliable binary copying

## Alternative: If Still Failing

If the above doesn't work, try manually fixing after install:

```bash
cd /srv/gymapp-fe

# After npm install
node -e "
const fs = require('fs');
const path = require('path');
const src = path.join(process.cwd(), 'node_modules', 'lightningcss', 'linux-x64-gnu', 'lightningcss.linux-x64-gnu.node');
const dst = path.join(process.cwd(), 'node_modules', 'lightningcss', 'lightningcss.linux-x64-gnu.node');
if (fs.existsSync(src) && !fs.existsSync(dst)) {
  fs.copyFileSync(src, dst);
  console.log('✓ Fixed lightningcss');
} else {
  console.log('⚠ Could not fix (files may not exist)');
  console.log('Src exists:', fs.existsSync(src));
  console.log('Dst exists:', fs.existsSync(dst));
}
"

# Then build
npm run build
```

## Debugging

If build still fails:

```bash
# Check if lightningcss exists
ls -la node_modules/lightningcss/

# Check for .node files
find node_modules/lightningcss -name "*.node" -ls

# Check what lightningcss is trying to load
cat node_modules/lightningcss/node/index.js | grep -A 5 "require"

# Check architecture
uname -m
node -p "process.platform + ' ' + process.arch"
```

## Why This Happens

Tailwind CSS v4 uses LightningCSS which has native bindings. The native binary is installed in:
- `node_modules/lightningcss/linux-x64-gnu/lightningcss.linux-x64-gnu.node`

But the module expects it in:
- `node_modules/lightningcss/lightningcss.linux-x64-gnu.node`

The fix copies it to the expected location.

## Recommended Approach

**Use Docker** - It's more reliable and handles all edge cases:
```bash
docker-compose up -d --build
```

Your production environment should be as similar as possible between local and VPS, and Docker ensures exactly that.

