# LightningCSS Binary Fix - Complete Solution

## Problem
Build fails with:
```
Error: Cannot find module '../lightningcss.linux-x64-gnu.node'
```

The lightningcss native binary is not in the expected location.

## Solution Applied

### 1. Created Dedicated Fix Script
- Moved fix logic to `scripts/fix-lightningcss.js`
- More robust binary detection
- Multiple fallback strategies
- Better error messages

### 2. Updated package.json
- Changed from inline script to dedicated file
- Easier to debug and maintain

### 3. Enhanced Dockerfile
- Added manual fallback in Dockerfile
- Better error handling

## Quick Fix on VPS

### Option 1: Reinstall lightningcss (Recommended)
```bash
cd /srv/gymapp-fe

# Remove and reinstall lightningcss
npm uninstall lightningcss
npm install lightningcss --legacy-peer-deps --include=optional

# Run fix script
npm run fix-lightningcss

# Verify binary exists
ls -lh node_modules/lightningcss/lightningcss.linux-x64-gnu.node

# Build
npm run build
```

### Option 2: Manual Binary Fix
```bash
cd /srv/gymapp-fe

# Find the binary
find node_modules/lightningcss -name "*.node" -type f

# Copy to expected location (replace PATH with actual path from find)
cp node_modules/lightningcss/PATH/lightningcss.linux-x64-gnu.node \
   node_modules/lightningcss/lightningcss.linux-x64-gnu.node

chmod +x node_modules/lightningcss/lightningcss.linux-x64-gnu.node

# Verify
ls -lh node_modules/lightningcss/lightningcss.linux-x64-gnu.node

# Build
npm run build
```

### Option 3: Use Docker (Best Solution)
```bash
cd /srv/gymapp-fe
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker compose build
docker compose up -d
```

Docker handles this automatically!

## Why This Happens

LightningCSS installs platform-specific native binaries. Sometimes:
1. The binary is in a subdirectory (`linux-x64-gnu/`)
2. The binary is in nested node_modules
3. The binary wasn't downloaded (network issue)
4. The binary is in a different location structure

## Verification

After fix, verify:
```bash
# Check binary exists
ls -lh node_modules/lightningcss/lightningcss.linux-x64-gnu.node

# Should show something like:
# -rwxr-xr-x 1 user user 2.5M Dec  9 10:00 lightningcss.linux-x64-gnu.node
```

## If Still Failing

1. **Check lightningcss installation:**
   ```bash
   ls -la node_modules/lightningcss/
   ```

2. **Reinstall with optional dependencies:**
   ```bash
   npm install lightningcss --legacy-peer-deps --include=optional
   ```

3. **Check npm version:**
   ```bash
   npm --version  # Should be 9+
   ```

4. **Use Docker instead** - it handles this automatically

## Expected Behavior

**After fix:**
```
✓ Fixed lightningcss binary from: linux-x64-gnu/lightningcss.linux-x64-gnu.node
✅ lightningcss binary verified at: node_modules/lightningcss/lightningcss.linux-x64-gnu.node
```

**Then build succeeds:**
```
Creating an optimized production build ...
✓ Compiled successfully
```

