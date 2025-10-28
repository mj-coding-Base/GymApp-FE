# Docker Build Troubleshooting Guide

## Issue: LightningCSS Native Binary Not Found

### Error Message
```
Error: Cannot find module '../lightningcss.linux-x64-gnu.node'
Require stack:
- /app/node_modules/lightningcss/node/index.js
```

### Root Cause
This error occurs because:
1. LightningCSS requires platform-specific native binaries (`.node` files)
2. During Docker build, the native binaries for `linux-x64-gnu` (Debian glibc) are not being properly installed
3. The optional dependencies for native modules might not be included during `npm ci`

### Solutions Applied

#### 1. **Include Optional Dependencies**
```dockerfile
RUN npm ci --legacy-peer-deps --include=optional
```
This ensures that optional native dependencies (like lightningcss binaries) are installed.

#### 2. **Reinstall LightningCSS with Latest Version**
```dockerfile
RUN npm install lightningcss@latest --no-save --legacy-peer-deps
```
This downloads the correct platform-specific binary for the build environment (linux-x64-gnu for Debian).

#### 3. **Verify Binary Exists**
After installation, we verify the binary is present:
```dockerfile
ls -la node_modules/lightningcss/linux-x64-gnu/
```

### Current Dockerfile Structure

The optimized Dockerfile uses a multi-stage build:

1. **deps stage**: Installs all dependencies including optional ones
2. **builder stage**: 
   - Reinstalls lightningcss to get correct binaries
   - Builds the Next.js application
3. **runner stage**: 
   - Copies standalone output (smaller image)
   - Verifies lightningcss binary exists
   - Runs as non-root user

### Alternative Solutions

If the above doesn't work, try these alternatives:

#### Option 1: Use Full node_modules Instead of Standalone
```dockerfile
# Instead of copying standalone output
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
```

#### Option 2: Disable Tailwind CSS Compilation During Build
```dockerfile
# In next.config.ts
module.exports = {
  // Temporarily disable CSS processing
  experimental: {
    optimizePackageImports: [],
  },
}
```

#### Option 3: Use Node 22 Instead of Node 20
```dockerfile
FROM node:22-slim AS deps
```
Some native modules work better with newer Node versions.

#### Option 4: Switch Back to PostCSS 7
If Tailwind v4 is causing too many issues, you can use Tailwind v3 which doesn't require lightningcss:
```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^3.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### Debugging Steps

If you still encounter issues, use these debugging commands:

#### 1. Check if lightningcss is installed
```bash
docker run --rm -it <your-image> ls -la node_modules/lightningcss/
```

#### 2. Find all .node files
```bash
docker run --rm -it <your-image> find node_modules -name "*.node" -ls
```

#### 3. Check platform requirements
```bash
docker run --rm -it <your-image> node -e "console.log(process.platform, process.arch)"
```

#### 4. Test lightningcss import
```bash
docker run --rm -it <your-image> node -e "require('lightningcss')"
```

### Build Cache Issues

If you're experiencing persistent build issues, try building without cache:
```bash
docker build --no-cache -t gymapp-fe .
```

### Known Issues

1. **Alpine Linux (musl)**: Alpine uses musl libc instead of glibc. Native binaries built for glibc won't work on Alpine. Use Debian-based images (`node:20-slim`) instead.

2. **Architecture Mismatch**: If building on ARM (Apple Silicon), ensure you're building for the correct architecture:
```bash
docker buildx build --platform linux/amd64 -t gymapp-fe .
```

3. **npm ci vs npm install**: `npm ci` is stricter and might skip optional dependencies. Use `--include=optional` flag.

### Prevention Strategies

1. **Lock file**: Ensure `package-lock.json` is committed and up to date
2. **Optional dependencies**: Always use `--include=optional` with `npm ci`
3. **Platform awareness**: Build on the same platform as deployment or use buildx for cross-platform builds
4. **Regular updates**: Keep lightningcss updated to the latest version

### Success Indicators

A successful build should show:
```
✓ lightningcss binary found
✓ Build completed successfully
```

In the build logs, you should see:
```
Creating an optimized production build ...
Route (app)                                  Size  First Load JS
```

### Additional Resources

- [LightningCSS Documentation](https://github.com/parcel-bundler/lightningcss)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Docker Buildx for Multi-platform](https://docs.docker.com/buildx/)

### Contact Support

If issues persist:
1. Check the full build logs for more context
2. Verify your Node version (`node -v`)
3. Ensure Docker has enough resources (CPU/RAM)
4. Try building locally first to isolate Docker-specific issues

