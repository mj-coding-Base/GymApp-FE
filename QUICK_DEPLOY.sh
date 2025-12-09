#!/bin/bash
# Quick deploy script for VPS - Frontend

set -e

echo "🚀 Frontend Deployment Script"
echo "=============================="
echo ""

cd /srv/gymapp-fe

# Enable BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

echo "📥 Pulling latest code..."
git pull

echo ""
echo "🛑 Stopping existing containers..."
docker compose down 2>/dev/null || true

echo ""
echo "🔨 Building Docker image..."
echo "   This may take 10-20 minutes on first build..."
echo ""

# Build with progress
if docker compose build --progress=plain 2>&1 | tee /tmp/frontend-build-$(date +%Y%m%d-%H%M%S).log; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting containers..."
    docker compose up -d
    
    echo ""
    echo "⏳ Waiting for container to start..."
    sleep 5
    
    echo ""
    echo "📊 Container status:"
    docker compose ps
    
    echo ""
    echo "📋 Recent logs:"
    docker compose logs --tail=20
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "Useful commands:"
    echo "  View logs:    docker compose logs -f"
    echo "  Check status: docker compose ps"
    echo "  Stop:         docker compose down"
else
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "Check the build log for errors."
    exit 1
fi

