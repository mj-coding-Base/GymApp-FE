# PM2 Deployment Checklist for Frontend

## Pre-Deployment Checklist

### ✅ 1. Configuration Files

- [x] **ecosystem.config.cjs** - PM2 configuration exists and is correct
  - Uses PM2 default logs (no permission issues)
  - Port configured (3002)
  - Environment variables set
  - Auto-restart enabled
  - Memory limits set (1GB)

- [x] **next.config.ts** - Next.js configuration
  - ✅ Standalone mode is **commented out** (required for PM2)
  - ✅ CSP headers allow styles (`'unsafe-inline' 'unsafe-hashes'`)
  - ✅ Static file caching configured
  - ✅ Security headers configured

- [x] **package.json** - Scripts configured
  - ✅ `build`: Includes native binary fixes
  - ✅ `start`: Uses start-prod.js script
  - ✅ `fix-lightningcss`: Fixes lightningcss binary
  - ✅ `fix-native-binaries`: Fixes @tailwindcss/oxide

- [x] **scripts/start-prod.js** - Production start script
  - ✅ Loads .env file
  - ✅ Validates port
  - ✅ Starts Next.js production server

### ✅ 2. Native Binaries

- [x] **scripts/fix-lightningcss.js** - Fixes lightningcss binary
- [x] **scripts/fix-native-binaries.js** - Fixes @tailwindcss/oxide binary
- [x] Both scripts run automatically during build

### ✅ 3. Build Process

The build process:
1. ✅ Runs `fix-lightningcss` (fixes lightningcss binary)
2. ✅ Runs `fix-native-binaries` (fixes @tailwindcss/oxide)
3. ✅ Runs `next build` (builds the app)

### ✅ 4. Environment Setup

Required environment variables:
- `NODE_ENV=production`
- `PORT=3002` (or your preferred port)
- `NEXT_PUBLIC_API_URL` (if needed)
- Any other API keys or configs

## Deployment Steps

### Step 1: Prepare Server

```bash
# Install PM2 globally
npm install -g pm2

# Create project directory
mkdir -p /srv/gymapp-fe
cd /srv/gymapp-fe
```

### Step 2: Clone/Update Code

```bash
# Clone repository (first time)
git clone <your-repo-url> .

# OR update existing code
git pull
```

### Step 3: Install Dependencies

```bash
cd /srv/gymapp-fe
npm install --legacy-peer-deps
```

### Step 4: Build Application

```bash
# Build (automatically runs native binary fixes)
npm run build

# Verify build succeeded
ls -la .next/
ls -la .next/static/css/  # Should contain CSS files
```

### Step 5: Configure Environment

```bash
# Create .env file if it doesn't exist
nano .env

# Add required variables:
# NODE_ENV=production
# PORT=3002
# NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Step 6: Start with PM2

```bash
# Start PM2
pm2 start ecosystem.config.cjs --env production

# Save PM2 process list
pm2 save

# Setup auto-start on reboot
pm2 startup
# Follow the instructions it provides
```

### Step 7: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check if app is listening
netstat -tulpn | grep 3002
# OR
lsof -i :3002

# Test the app
curl http://localhost:3002

# Check logs
pm2 logs gymapp-fe --lines 50
```

## Quick Deployment Script

Use the automated deployment script:

```bash
cd /srv/gymapp-fe
chmod +x deploy-pm2.sh
./deploy-pm2.sh
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3002

# Kill it
kill -9 <PID>

# OR use the fix script
chmod +x FORCE_FIX_PORT.sh
./FORCE_FIX_PORT.sh
```

### CSS Not Loading

1. Verify `output: 'standalone'` is commented out in `next.config.ts`
2. Rebuild: `npm run build`
3. Check CSS files exist: `ls -la .next/static/css/`
4. Restart PM2: `pm2 restart gymapp-fe`

### Native Binary Errors

```bash
# Re-run fixes
npm run fix-lightningcss
npm run fix-native-binaries

# Rebuild
npm run build
```

### Build Fails

```bash
# Clean and rebuild
rm -rf .next node_modules/.cache
npm install --legacy-peer-deps
npm run build
```

## Maintenance

### Update Application

```bash
cd /srv/gymapp-fe
git pull
npm install --legacy-peer-deps
npm run build
pm2 reload gymapp-fe
```

### View Logs

```bash
# All logs
pm2 logs gymapp-fe

# Last 100 lines
pm2 logs gymapp-fe --lines 100

# Follow logs
pm2 logs gymapp-fe --lines 0
```

### Monitor Resources

```bash
# Real-time monitoring
pm2 monit

# Status
pm2 status
```

## Important Notes

1. **Standalone Mode**: Must be **commented out** for PM2 deployment
2. **Logs**: Use PM2 default location (`~/.pm2/logs/`) to avoid permission issues
3. **Port Conflicts**: Always check port before starting: `lsof -i :3002`
4. **Native Binaries**: Must be fixed before build (handled automatically)
5. **Environment Variables**: Must be set in `.env` file

## Verification Checklist

After deployment, verify:

- [ ] PM2 shows app as "online"
- [ ] App responds to HTTP requests
- [ ] CSS/styles are loading correctly
- [ ] No errors in PM2 logs
- [ ] Port is listening: `netstat -tulpn | grep 3002`
- [ ] Health check passes: `curl http://localhost:3002`

## Files Summary

| File | Purpose | Status |
|------|---------|--------|
| `ecosystem.config.cjs` | PM2 configuration | ✅ Ready |
| `scripts/start-prod.js` | Production start script | ✅ Ready |
| `next.config.ts` | Next.js config (standalone disabled) | ✅ Ready |
| `package.json` | Build scripts | ✅ Ready |
| `scripts/fix-lightningcss.js` | Fix lightningcss binary | ✅ Ready |
| `scripts/fix-native-binaries.js` | Fix @tailwindcss/oxide | ✅ Ready |
| `deploy-pm2.sh` | Automated deployment | ✅ Ready |

## Ready for Deployment! ✅

All files are configured and ready for PM2 deployment.

