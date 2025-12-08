# CI/CD Build Fix Instructions

## Current Issue
LightningCSS native binary is not being found during build. This is a known issue with Tailwind CSS v4's dependency on lightningcss.

## Immediate Fix: Use Alternative Dockerfile

### For CI/CD

If you're using **GitHub Actions**, update your workflow to use the alternative Dockerfile:

```yaml
- name: Build Docker image
  run: docker build -f Dockerfile.alternative -t gymapp-fe .
```

If using Docker Compose or Docker CLI:
```bash
docker build -f Dockerfile.alternative -t gymapp-fe .
```

### What Changed in docker-compose.yml
```yaml
build:
  dockerfile: Dockerfile.alternative  # Now uses alternative
```

## Permanent Solution Options

### Option 1: Downgrade to Tailwind CSS v3 (RECOMMENDED)

**Why**: Tailwind v4 is still new and has compatibility issues with Docker builds. Tailwind v3 is stable and mature.

**Steps**:
1. Edit `package.json`:
```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^3.0.0",
    "tailwindcss": "^3.4.1"
  }
}
```

2. Remove Tailwind v4 dependencies:
```bash
npm uninstall @tailwindcss/postcss @tailwindcss/tailwindcss
npm install -D tailwindcss@^3.4.1 autoprefixer@^10.4.17 postcss@^8.4.33
```

3. Update `postcss.config.mjs` for Tailwind v3:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

4. Rebuild:
```bash
npm install
docker build -t gymapp-fe .
```

### Option 2: Fix LightningCSS Binary Location

The issue is that lightningcss expects the binary at:
```
node_modules/lightningcss/lightningcss.linux-x64-gnu.node
```

But it's installed at:
```
node_modules/lightningcss/linux-x64-gnu/lightningcss.linux-x64-gnu.node
```

Add this to your Dockerfile (before `npm run build`):
```dockerfile
# Fix lightningcss binary location
RUN if [ -f "node_modules/lightningcss/linux-x64-gnu/lightningcss.linux-x64-gnu.node" ] && [ ! -f "node_modules/lightningcss/lightningcss.linux-x64-gnu.node" ]; then \
      cp node_modules/lightningcss/linux-x64-gnu/lightningcss.linux-x64-gnu.node \
         node_modules/lightningcss/lightningcss.linux-x64-gnu.node; \
    fi
```

### Option 3: Force Specific LightningCSS Version

Pin to an older version that had better Docker support:
```bash
npm install --save-dev lightningcss@1.19.0
```

## Try These Commands

### Test locally first:
```bash
docker build -f Dockerfile.alternative -t gymapp-fe .
docker run -p 3002:3002 gymapp-fe
```

### If that works, update your CI/CD to use:
```bash
docker build -f Dockerfile.alternative -t gymapp-fe .
```

## Debug Steps

If still failing, debug with:
```bash
# Build with debugging
docker build --progress=plain -f Dockerfile.alternative -t gymapp-fe .

# Check what's in lightningcss
docker run --rm gymapp-fe ls -la node_modules/lightningcss/

# Check for .node files
docker run --rm gymapp-fe find node_modules/lightningcss -name "*.node" -ls
```

## Recommendation

**Use Option 1** (downgrade to Tailwind v3). It's the most reliable solution and you won't have any Docker build issues. Tailwind v4 is very new and this issue will likely be fixed in future versions, but for now, v3 is production-ready.

## Files Available

1. `Dockerfile` - Current (has lightningcss issues)
2. `Dockerfile.alternative` - Fallback (no standalone mode, full node_modules)
3. `docker-compose.yml` - Updated to use alternative
4. This file - Instructions

## Next Steps

1. Try the alternative Dockerfile first
2. If it still fails, downgrade to Tailwind v3 (Option 1)
3. Test locally before pushing to CI/CD

