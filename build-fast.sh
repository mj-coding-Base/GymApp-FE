#!/bin/bash
# Fast Docker build script with BuildKit enabled for Frontend

set -e

echo "🚀 Starting fast Docker build with BuildKit (Frontend)..."
echo ""

# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Verify .dockerignore is active
if ! grep -q "^node_modules/" .dockerignore 2>/dev/null; then
    echo "⚠️  WARNING: .dockerignore might not be configured correctly"
    echo "   Make sure node_modules, .next, and other large dirs are excluded"
fi

# Check build context size
echo "📦 Checking build context..."
CONTEXT_SIZE=$(du -sh . | cut -f1)
echo "   Context size: $CONTEXT_SIZE"
echo ""

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down 2>/dev/null || true

# Build with progress output
echo "🔨 Building Docker image (this may take a few minutes)..."
echo "   Using BuildKit cache for faster rebuilds"
echo ""

# Build with detailed progress
docker compose build --progress=plain 2>&1 | tee /tmp/docker-build-fe.log

# Check if build succeeded
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo "✅ Build successful! Starting containers..."
    docker compose up -d
    
    echo ""
    echo "✅ Complete! Containers are starting..."
    echo "📊 Check status with: docker compose ps"
    echo "📋 View logs with: docker compose logs -f"
else
    echo ""
    echo "❌ Build failed! Check the output above for errors."
    echo "📋 Full build log saved to: /tmp/docker-build-fe.log"
    exit 1
fi

