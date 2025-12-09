# LightningCSS Binary Fix - Complete Solution

## Problem
Build fails with:
```
Error: Cannot find module '../lightningcss.linux-x64-gnu.node'
```

## Root Cause
The lightningcss native binary is not in the expected location. LightningCSS installs platform-specific binaries in subdirectories, and they need to be copied to the root of the lightningcss package.

## Solution Applied

### 1. Created Proper Fix Script
Created `scripts/fix-lightningcss.js` that:
- Searches multiple locations for the binary
- Tries to reinstall optional dependencies if not found
- Copies binary to expected location
- Verifies the copy succeeded

### 2. Updated package.json
Changed from inline script to proper Node.js script:
```json
"fix-lightningcss": "node scripts/fix-lightningcss.js"
```

### 3. Updated Dockerfile
- Ensures optional dependencies are installed
- Runs fix script that must succeed (no warnings)

## Quick Fix on VPS

### Option 1: Use Docker (Recommended)
```bash
cd /srv/gymapp-fe
git pull
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker compose build
docker compose up -d
```

### Option 2: Fix Directly on VPS
```bash
cd /srv/gymapp-fe

# 1. Pull latest code (with new fix script)
git pull

# 2. Reinstall dependencies with optional packages
npm install --legacy-peer-deps --include=optional

# 3. Run the fix script
npm run fix-lightningcss

# 4. Verify binary exists
ls -lh node_modules/lightningcss/lightningcss.linux-x64-gnu.node

# 5. Build
npm run build
```

## Manual Fix (If Script Fails)

```bash
cd /srv/gymapp-fe

# Find the binary
find node_modules/lightningcss -name "lightningcss.linux-x64-gnu.node" -type f

# Copy it to expected location
cp node_modules/lightningcss/linux-x64-gnu/lightningcss.linux-x64-gnu.node \
   node_modules/lightningcss/lightningcss.linux-x64-gnu.node

# Make it executable
chmod +x node_modules/lightningcss/lightningcss.linux-x64-gnu.node

# Verify
ls -lh node_modules/lightningcss/lightningcss.linux-x64-gnu.node
```

## Why This Happens

LightningCSS uses native binaries that are installed as optional dependencies. The binary location varies:
- Sometimes in `linux-x64-gnu/` subdirectory
- Sometimes in `node_modules/lightningcss-linux-x64-gnu/`
- The package expects it at the root: `lightningcss.linux-x64-gnu.node`

## Verification

After fix, verify:
```bash
# Check binary exists
ls -lh node_modules/lightningcss/lightningcss.linux-x64-gnu.node

# Check it's executable
file node_modules/lightningcss/lightningcss.linux-x64-gnu.node

# Try building
npm run build
```

## Expected Output

**Successful fix:**
```
🔧 Fixing lightningcss binary...
Target location: node_modules/lightningcss/lightningcss.linux-x64-gnu.node

📦 Checking common locations...
✓ Found at: node_modules/lightningcss/linux-x64-gnu/lightningcss.linux-x64-gnu.node

✅ Successfully copied binary to: node_modules/lightningcss/lightningcss.linux-x64-gnu.node
   Source: node_modules/lightningcss/linux-x64-gnu/lightningcss.linux-x64-gnu.node
   Size: 2.34 MB
✅ lightningcss binary is ready!
```

## If Still Failing

1. **Reinstall lightningcss:**
   ```bash
   npm uninstall lightningcss
   npm install --legacy-peer-deps --include=optional lightningcss
   npm run fix-lightningcss
   ```

2. **Check Node.js version:**
   ```bash
   node --version  # Should be 20+
   ```

3. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps --include=optional
   npm run fix-lightningcss
   ```

