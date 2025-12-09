# Frontend Docker Build Optimization

## Optimizations Applied

### 1. BuildKit Cache Mounts
- ✅ **npm cache** - Persists between builds (`/root/.npm`)
- ✅ **apt cache** - Faster package installations (`/var/cache/apt`, `/var/lib/apt`)
- ✅ **Next.js build cache** - Faster rebuilds (`.next/cache`)

### 2. Improved .dockerignore
- Excludes `node_modules/`, `.next/`, build artifacts
- Excludes large files (`.tar.gz`, `.zip`, `.map`)
- Reduces build context size significantly

### 3. Better Layer Caching
- Package files copied first (changes less frequently)
- Source code copied last (changes most frequently)
- Selective file copying for better cache hits

## Build Commands

### Fast Build (Recommended)
```bash
# Enable BuildKit and build
DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker compose up -d --build
```

Or use the script:
```bash
chmod +x build-fast.sh
./build-fast.sh
```

### Make BuildKit Permanent
Add to `~/.bashrc`:
```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

Then reload:
```bash
source ~/.bashrc
```

## Expected Build Times

- **First build:** 10-15 minutes (downloads dependencies, builds Next.js)
- **Subsequent builds (no changes):** 2-5 minutes ⚡
- **Subsequent builds (code changes):** 5-10 minutes ⚡

## What Changed

### Before
- No BuildKit cache mounts
- npm cache cleared every build
- apt packages downloaded every build
- Next.js cache not persisted

### After
- BuildKit cache mounts for all caches
- npm cache persists (faster dependency installs)
- apt cache persists (faster system package installs)
- Next.js build cache persists (faster rebuilds)
- Better .dockerignore (smaller build context)

## Troubleshooting

### Still Slow?
1. Verify BuildKit is enabled:
   ```bash
   echo $DOCKER_BUILDKIT  # Should output: 1
   ```

2. Check build context size:
   ```bash
   du -sh .
   # Should be under 100MB (without node_modules)
   ```

3. Verify .dockerignore:
   ```bash
   cat .dockerignore | grep node_modules
   # Should show: node_modules/
   ```

### Build Fails?
```bash
# Clean build (no cache)
docker compose build --no-cache

# See detailed output
DOCKER_BUILDKIT=1 docker compose build --progress=plain
```

## Quick Reference

```bash
# Fast build
DOCKER_BUILDKIT=1 docker compose up -d --build

# View logs
docker compose logs -f gymapp-fe

# Check status
docker compose ps

# Stop containers
docker compose down
```

