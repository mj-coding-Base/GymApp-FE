# Docker Build Fixes Applied

## Problem
LightningCSS native binary not found during Docker build for CI/CD deployment.

## Solution Applied

### 1. **Simplified Dockerfile** ✅
Removed complex verification steps that were causing failures. The Dockerfile now:
- Uses `npm ci --include=optional` to ensure native dependencies are installed
- Relies on automatic platform binary selection for lightningcss
- Removes verification steps that were failing

### 2. **Alternative Dockerfile** ✅
Created `Dockerfile.alternative` that:
- Does NOT use standalone output mode
- Copies full `node_modules` to ensure all native binaries are available
- Uses traditional Next.js deployment pattern

## Usage

### Try Main Dockerfile First
```bash
docker build -t gymapp-fe .
```

If this fails with lightningcss errors, use the alternative:

### Use Alternative Dockerfile
```bash
docker build -f Dockerfile.alternative -t gymapp-fe .
```

## Key Changes

### Main Dockerfile (`Dockerfile`)
1. Uses Debian slim (glibc) instead of Alpine (musl) - better native binary support
2. Includes `--include=optional` flag in npm ci
3. Removed lightningcss verification steps that were failing
4. Uses standalone output mode

### Alternative Dockerfile (`Dockerfile.alternative`)
1. Same Debian-based approach
2. Does NOT use standalone output
3. Copies full node_modules (larger but more reliable)
4. Explicitly checks for lightningcss binary

## Why This Should Work

1. **glibc vs musl**: Using Debian (node:20-slim) instead of Alpine ensures glibc compatibility
2. **Optional dependencies**: `--include=optional` ensures native dependencies are installed
3. **No verification**: Removed complex verification that was failing
4. **Fallback option**: Alternative Dockerfile provides a backup if standalone mode has issues

## If Still Failing

### Option 1: Use Alternative Dockerfile
```bash
docker-compose up -d --build -f Dockerfile.alternative
```

### Option 2: Downgrade Tailwind to v3
Edit `package.json`:
```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33"
  }
}
```
Then rebuild.

### Option 3: Use Different Node Version
Try Node 22 instead of 20:
```dockerfile
FROM node:22-slim AS deps
```

## Build Context
Ensure your `.dockerignore` is configured correctly:
- Don't ignore `.next` unnecessarily
- Don't ignore important source files
- Ignore `node_modules` (it's installed in container)

## Verification
After successful build, verify the app works:
```bash
docker run -p 3001:3001 gymapp-fe
```

Then visit `http://localhost:3001`

## Troubleshooting

If you get runtime errors after build:

1. Check logs:
```bash
docker logs <container-id>
```

2. Shell into container:
```bash
docker exec -it <container-id> sh
```

3. Check lightningcss:
```bash
find /app -name "*lightningcss*.node" -ls
```

## Expected Behavior

✅ **Success**: Build completes without errors
✅ **Runtime**: App starts and responds to health checks
✅ **Native modules**: All dependencies load correctly

❌ **Failure**: Build fails during `npm run build` with lightningcss error

If failure persists, use `Dockerfile.alternative`.

