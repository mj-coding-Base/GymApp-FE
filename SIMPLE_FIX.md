# Simple Fix for Hanging Docker Build

## The Problem
Docker build hangs at `[+] Building 0.0s (0/0)` - BuildKit is not enabled.

## The Solution (Copy and Paste This)

```bash
cd /srv/gymapp-fe
git pull
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker compose down
docker compose build --progress=plain
docker compose up -d
```

## If That Doesn't Work

### Option 1: Build Directly (Bypass Compose)
```bash
cd /srv/gymapp-fe
DOCKER_BUILDKIT=1 docker build -t gymapp-fe:latest --progress=plain . 2>&1 | head -100
```

### Option 2: Check What's Wrong
```bash
# Check if BuildKit is enabled
echo $DOCKER_BUILDKIT

# Check Docker version (needs 20.10+)
docker --version

# Check build context size
du -sh .

# Check if package-lock.json exists
ls -lh package-lock.json
```

### Option 3: Restart Docker
```bash
sudo systemctl restart docker
DOCKER_BUILDKIT=1 docker compose up -d --build
```

## Most Common Issue

BuildKit is not enabled. Always run:
```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

Before building.

