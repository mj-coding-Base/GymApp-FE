# Frontend Deployment Fix

## Problem
Docker build failed with:
```
npm error [--include <prod|dev|optional|peer> ...]
npm error aliases: clean-install, ic, install-clean, isntall-clean
```

## Root Cause
The `--include=optional` flag is **not supported** by `npm ci`. This flag only works with `npm install`.

## Solution Applied

### 1. Removed Invalid Flag
- Removed `--include=optional` from `npm ci` command
- `npm ci` includes optional dependencies by default, so the flag was unnecessary

### 2. Added Network Resilience
- Increased timeout to 300 seconds
- Added 5 automatic retries
- Configured retry delays
- Reduced concurrency for stability

### 3. Added Retry Logic
- Automatic retry up to 5 times
- 10 second delay between retries
- Validates installation before proceeding

## Key Changes

**Before (BROKEN):**
```dockerfile
RUN npm ci --legacy-peer-deps --include=optional
```

**After (FIXED):**
```dockerfile
RUN npm ci --legacy-peer-deps
# Optional dependencies are included by default in npm ci
```

## Quick Deploy

```bash
# Pull latest changes
git pull

# Build with BuildKit
DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker compose up -d --build
```

## npm ci vs npm install

### npm ci (Recommended for Docker)
- ✅ Faster and more reliable
- ✅ Installs exactly from package-lock.json
- ✅ Includes optional dependencies by default
- ✅ Fails if package-lock.json is out of sync
- ❌ Does NOT support `--include` flag

### npm install (Alternative)
- ✅ More flexible
- ✅ Supports `--include=optional` flag
- ✅ Updates package-lock.json if needed
- ❌ Slower
- ❌ Less reproducible

## Why npm ci is Better

1. **Reproducibility**: Installs exact versions from package-lock.json
2. **Speed**: Faster than npm install
3. **Reliability**: Fails fast if dependencies are inconsistent
4. **Optional deps**: Includes optional dependencies automatically

## If You Need Optional Dependencies Control

If you need to exclude optional dependencies (unlikely), use:
```dockerfile
RUN npm ci --legacy-peer-deps --omit=optional
```

But for most cases, just use:
```dockerfile
RUN npm ci --legacy-peer-deps
```

## Expected Build Output

**Normal build:**
```
Attempt 1 of 5: Installing dependencies...
added 1234 packages, and audited 1235 packages
✅ Success on first attempt
```

**With network issues:**
```
Attempt 1 of 5: Installing dependencies...
Attempt 1 failed, waiting 10 seconds before retry...
Attempt 2 of 5: Installing dependencies...
✅ Success on attempt 2
```

## Troubleshooting

### If Build Still Fails

1. **Check package-lock.json is up to date:**
   ```bash
   npm install --package-lock-only
   git add package-lock.json
   git commit -m "Update package-lock.json"
   ```

2. **Clear BuildKit cache:**
   ```bash
   docker builder prune --filter type=exec.cachemount
   ```

3. **Use npm install as fallback** (if npm ci continues to fail):
   ```dockerfile
   RUN npm install --legacy-peer-deps --include=optional
   ```
   (Note: This is less strict but more forgiving)

4. **Check network connectivity:**
   ```bash
   curl -I https://registry.npmjs.org/
   ```

## Success Indicators

✅ Build completes without errors
✅ All dependencies installed (including optional)
✅ lightningcss binary fixed
✅ Next.js build succeeds
✅ Container starts successfully

## Next Steps After Successful Build

1. **Monitor container:**
   ```bash
   docker compose logs -f
   ```

2. **Check health:**
   ```bash
   docker compose ps
   curl http://localhost:3002/
   ```

3. **Verify lightningcss:**
   ```bash
   docker compose exec app ls -la node_modules/lightningcss/*.node
   ```

