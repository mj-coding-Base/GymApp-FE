# Fix Tailwind CSS Not Working in PM2 Deployment

## Problem
Tailwind CSS styles are not visible or functional when deployed with PM2.

## Root Causes
1. **Standalone mode issue**: `output: 'standalone'` is designed for Docker, not PM2
2. **Static files not accessible**: CSS files in `.next/static` might not be served correctly
3. **CSP headers**: Content Security Policy might be blocking styles
4. **Build output**: CSS might not be included in the build

## Solutions

### Solution 1: Remove Standalone Mode (Recommended for PM2)

When using PM2 (not Docker), remove `output: 'standalone'` from `next.config.ts`:

```typescript
// Remove or comment out this line:
// output: 'standalone',
```

Then rebuild:
```bash
cd /srv/gymapp-fe
npm run build
pm2 restart gymapp-fe
```

### Solution 2: Ensure Static Files Are Served

If you must use standalone mode, ensure static files are copied:

```bash
cd /srv/gymapp-fe
# After build, verify static files exist
ls -la .next/static/css/
ls -la .next/static/chunks/

# If missing, rebuild
npm run build
```

### Solution 3: Fix CSP Headers

The CSP headers have been updated to allow styles. Make sure you pull the latest code:

```bash
cd /srv/gymapp-fe
git pull
npm run build
pm2 restart gymapp-fe
```

### Solution 4: Check Build Output

Verify CSS is being generated:

```bash
cd /srv/gymapp-fe
npm run build

# Check if CSS files exist
find .next -name "*.css" -type f

# Should show files like:
# .next/static/css/[hash].css
```

## Complete Fix Steps

Run these commands on your VPS:

```bash
cd /srv/gymapp-fe

# 1. Pull latest code (with CSP fix)
git pull

# 2. Clean build
rm -rf .next
npm run build

# 3. Verify CSS files exist
ls -la .next/static/css/ || echo "CSS files not found!"

# 4. Restart PM2
pm2 restart gymapp-fe

# 5. Check logs
pm2 logs gymapp-fe --lines 50
```

## Verify Fix

1. **Check browser console**: Open DevTools and check for CSS loading errors
2. **Check Network tab**: Verify CSS files are being loaded (status 200)
3. **Check build output**: CSS files should exist in `.next/static/css/`

## If Still Not Working

### Check if CSS is being generated:
```bash
cd /srv/gymapp-fe
grep -r "tailwindcss" .next/static/css/ | head -5
```

### Check browser network requests:
- Open DevTools → Network tab
- Filter by CSS
- Check if CSS files return 200 status
- Check if CSS files are being blocked by CSP

### Rebuild with verbose output:
```bash
cd /srv/gymapp-fe
NODE_ENV=production npm run build 2>&1 | tee build.log
```

### Check PM2 is serving static files:
```bash
# Test if static files are accessible
curl http://localhost:3002/_next/static/css/[hash].css
```

## Alternative: Use Regular Next.js Build (Not Standalone)

If standalone mode continues to cause issues, modify `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Remove or comment out:
  // output: 'standalone',
  
  // ... rest of config
};
```

Then rebuild and restart.

