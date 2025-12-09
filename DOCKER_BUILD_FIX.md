# Docker Build Fix for lightningcss Issue

## Problem
The Docker build is failing because `lightningcss` is being removed from `node_modules` when `npm install --no-save` runs in the builder stage.

## Root Cause
- `lightningcss` is not a direct dependency in `package.json` (it's a transitive dependency)
- When `npm install --no-save` runs, it recalculates the dependency tree and removes packages that aren't direct dependencies
- The old Dockerfile had an `npm install` command in the builder stage that was causing this

## Solution
The Dockerfile has been updated to:
1. **Remove all `npm install` commands from the builder stage** - everything should already be installed in the deps stage
2. **Only verify packages exist** - don't try to install them again
3. **Fail fast if packages are missing** - this indicates a problem in the deps stage

## How to Fix on VPS

### Option 1: Rebuild without cache (Recommended)
```bash
cd /srv/gymapp-fe
git pull  # Make sure you have the latest Dockerfile
docker compose build --no-cache
docker compose up -d
```

### Option 2: Force rebuild specific stage
```bash
cd /srv/gymapp-fe
git pull
docker compose build --no-cache --progress=plain 2>&1 | tee build.log
docker compose up -d
```

### Option 3: Manual verification
If the build still fails, check if `lightningcss` is in the deps stage:
```bash
# Build just the deps stage to verify
docker build --target deps -t gymapp-fe-deps .
docker run --rm gymapp-fe-deps ls -la node_modules/ | grep lightning
```

## Verification
After the build succeeds, verify both packages are present:
```bash
docker compose exec app ls -la node_modules/lightningcss/
docker compose exec app ls -la node_modules/@tailwindcss/oxide-linux-x64-gnu/
```

## Notes
- The `lightningcss` package should be installed in the **deps stage** (line 27 of Dockerfile)
- The builder stage should **only copy** `node_modules` from deps, not modify it
- If `lightningcss` is missing, it means the deps stage installation failed

