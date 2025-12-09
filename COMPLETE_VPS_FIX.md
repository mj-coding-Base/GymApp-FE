# Complete VPS Fix Guide

## The Problem
LightningCSS binary not found when building on VPS directly (not using Docker).

## Solution: Use Docker (Recommended)

**Don't build directly on VPS - use Docker:**

```bash
cd /srv/gymapp-fe
git pull
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker compose build
docker compose up -d
```

Docker handles all dependencies and binary fixes automatically!

## Alternative: Manual Fix (If You Must Build Directly)

### Quick Fix Script
```bash
cd /srv/gymapp-fe
chmod +x VPS_MANUAL_FIX.sh
./VPS_MANUAL_FIX.sh
npm run build
```

### Manual Steps
```bash
cd /srv/gymapp-fe

# 1. Find the binary
find node_modules/lightningcss -name "*.node" -type f

# 2. Copy to expected location (replace PATH with actual path from step 1)
cp node_modules/lightningcss/PATH/lightningcss.linux-x64-gnu.node \
   node_modules/lightningcss/lightningcss.linux-x64-gnu.node

# 3. Make executable
chmod +x node_modules/lightningcss/lightningcss.linux-x64-gnu.node

# 4. Verify
ls -lh node_modules/lightningcss/lightningcss.linux-x64-gnu.node

# 5. Build
npm run build
```

### If Binary Still Not Found
```bash
# Reinstall lightningcss with optional dependencies
npm uninstall lightningcss
npm install lightningcss --legacy-peer-deps --include=optional

# Install platform-specific package
npm install --no-save lightningcss-linux-x64-gnu --legacy-peer-deps

# Run fix
npm run fix-lightningcss

# Build
npm run build
```

## Why Docker is Better

✅ **No manual fixes needed** - Everything is automated
✅ **Reproducible** - Same result every time  
✅ **Isolated** - Doesn't pollute VPS with node_modules
✅ **Faster** - Uses BuildKit caching
✅ **Production-ready** - Optimized for deployment

## Recommended Approach

**Always use Docker on VPS:**

```bash
cd /srv/gymapp-fe
git pull
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker compose down
docker compose build --progress=plain
docker compose up -d
docker compose logs -f
```

This is the proper way to deploy applications on VPS.

