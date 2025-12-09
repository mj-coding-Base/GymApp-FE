# Quick Build Guide - Frontend Docker Optimization

## The Problem
Docker builds were taking too long. This has been fixed!

## Quick Fix (One Command)

```bash
# Enable BuildKit and build
DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker compose up -d --build
```

Or use the provided script:
```bash
chmod +x build-fast.sh
./build-fast.sh
```

## What Changed?

1. **BuildKit Cache Mounts** - npm cache persists between builds
2. **Optimized .dockerignore** - Excludes large files and directories
3. **Better Layer Caching** - Only rebuilds what changed
4. **Simplified lightningcss fix** - Uses npm script instead of verbose shell commands

## Expected Build Times

- **First build:** 10-15 minutes (downloads all dependencies)
- **Rebuilds (no changes):** 2-5 minutes ⚡
- **Rebuilds (code changes):** 3-7 minutes ⚡

## Always Use BuildKit

Add to your `~/.bashrc` or `~/.zshrc`:
```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

Then reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

## Troubleshooting

### Still Slow?
1. Check if BuildKit is enabled:
   ```bash
   echo $DOCKER_BUILDKIT  # Should output: 1
   ```

2. Check disk space:
   ```bash
   df -h
   ```

3. Check Docker version (needs 20.10+):
   ```bash
   docker --version
   ```

### Build Fails?
```bash
# Clean build (no cache)
docker compose build --no-cache

# See detailed output
DOCKER_BUILDKIT=1 docker compose build --progress=plain
```

## Quick Commands

```bash
# Fast build
DOCKER_BUILDKIT=1 docker compose up -d --build

# View logs
docker compose logs -f

# Check status
docker compose ps

# Stop containers
docker compose down

# Rebuild specific service
docker compose build app
```

