# VPS Build Fix - Proper Solution

## Problem
Running `npm run build` on VPS fails with:
1. `next: not found` - Next.js CLI not installed
2. `lightningcss binary source not found` - Dependencies not installed

## Root Cause
`node_modules` is not installed on the VPS. You need to install dependencies first.

## Solution

### Option 1: Use Docker (Recommended for VPS)

**Don't build directly on VPS - use Docker instead:**

```bash
cd /srv/gymapp-fe

# Pull latest code
git pull

# Build with Docker (includes all dependencies)
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker compose build --progress=plain
docker compose up -d
```

### Option 2: Build Directly on VPS (If Needed)

If you really need to build directly on VPS:

```bash
cd /srv/gymapp-fe

# 1. Install dependencies first
npm install --legacy-peer-deps

# 2. Fix lightningcss (runs automatically via postinstall, but run explicitly)
npm run fix-lightningcss

# 3. Now build
npm run build
```

**Note:** Building directly on VPS is NOT recommended because:
- Requires Node.js and npm on VPS
- Requires all build tools
- Slower than Docker
- Harder to maintain

## Why Docker is Better

✅ **Isolated environment** - No need to install Node.js on VPS
✅ **Reproducible builds** - Same result every time
✅ **Faster** - Uses BuildKit caching
✅ **Cleaner** - No `node_modules` on VPS filesystem
✅ **Production-ready** - Optimized for deployment

## Quick Fix Commands

### For Docker (Recommended):
```bash
cd /srv/gymapp-fe
git pull
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker compose down
docker compose build --progress=plain 2>&1 | tee build.log
docker compose up -d
docker compose logs -f
```

### For Direct Build (Not Recommended):
```bash
cd /srv/gymapp-fe
npm install --legacy-peer-deps
npm run build
```

## Troubleshooting

### If Docker build hangs:
```bash
# Check BuildKit is enabled
echo $DOCKER_BUILDKIT  # Should show: 1

# Check build context
du -sh .
ls -la | grep node_modules  # Should NOT exist

# Try building with verbose output
docker compose build --progress=plain 2>&1 | head -100
```

### If direct build fails:
```bash
# Check Node.js version (needs 20+)
node --version

# Check npm version
npm --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Check lightningcss
ls -la node_modules/lightningcss/ 2>/dev/null || echo "lightningcss not installed"
```

## Expected Behavior

**With Docker:**
```
[+] Building 15.2s (15/15) FINISHED
 => [deps 6/6] RUN npm ci --legacy-peer-deps
 => [builder 5/8] RUN npm run build
✅ Build successful
```

**With Direct Build:**
```
> npm install --legacy-peer-deps
added 1234 packages
> npm run fix-lightningcss
✓ Fixed lightningcss binary
> npm run build
✓ Build successful
```

## Recommendation

**Always use Docker on VPS.** It's the proper way to deploy applications.
