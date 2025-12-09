# VPS Deployment Instructions

## Important Notes

1. **The Docker build should be done on your VPS, not locally on Windows**
2. **Docker Desktop must be running if you want to test locally on Windows**
3. **The fixes have been applied to the Dockerfile - you need to deploy them to your VPS**

## Steps to Deploy on VPS

### 1. Connect to your VPS
```bash
ssh deploy@mail-server
```

### 2. Navigate to the project directory
```bash
cd /srv/gymapp-fe
```

### 3. Pull the latest changes
```bash
git pull origin main
# or
git pull origin master
```

### 4. Verify the Dockerfile has the fixes
```bash
# Check that the builder stage doesn't have npm install commands
grep -A 5 "Fix native binaries" Dockerfile
```

### 5. Rebuild without cache
```bash
docker compose build --no-cache
```

### 6. Start the container
```bash
docker compose up -d
```

### 7. Check logs
```bash
docker compose logs -f
```

## If Build Still Fails

### Check if lightningcss is in deps stage
```bash
# Build just the deps stage
docker build --target deps -t gymapp-fe-deps .

# Check if lightningcss exists
docker run --rm gymapp-fe-deps ls -la node_modules/ | grep lightning
```

### Verify package.json includes lightningcss
```bash
# On VPS
cd /srv/gymapp-fe
grep -i lightningcss package.json
```

## For Local Windows Testing (Optional)

If you want to test locally on Windows:

1. **Start Docker Desktop** - Make sure it's running
2. **Wait for it to fully start** - Check the Docker Desktop icon in system tray
3. **Then run:**
   ```bash
   docker compose build --no-cache
   docker compose up -d
   ```

## Troubleshooting

### Error: "lightningcss not installed"
- This means the deps stage didn't install it properly
- Check the deps stage installation command in Dockerfile (line 27)
- Verify `package-lock.json` is up to date

### Error: "@tailwindcss/oxide-linux-x64-gnu not found"
- This should be installed in the deps stage
- Check line 27 of Dockerfile - it should include `@tailwindcss/oxide-linux-x64-gnu`

### Build takes too long
- Use BuildKit: `DOCKER_BUILDKIT=1 docker compose build`
- Or enable BuildKit in Docker Desktop settings

## Quick Deploy Script

Save this as `deploy.sh` on your VPS:

```bash
#!/bin/bash
set -e

cd /srv/gymapp-fe
echo "📥 Pulling latest changes..."
git pull

echo "🔨 Building Docker image..."
docker compose build --no-cache

echo "🚀 Starting container..."
docker compose up -d

echo "📋 Checking status..."
docker compose ps

echo "✅ Deployment complete!"
echo "📊 View logs with: docker compose logs -f"
```

Make it executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

