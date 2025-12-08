#!/bin/bash

# GymApp Frontend Deployment Script
# This script builds and runs the Docker container on your VPS

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Stop and remove existing container if it exists
echo "Stopping existing container..."
docker-compose down 2>/dev/null || true

# Pull latest changes
echo "Pulling latest code..."
git pull

# Build and start the container
echo "Building Docker image..."
docker-compose build --no-cache

echo "Starting container..."
docker-compose up -d

# Wait for container to start
echo "Waiting for container to start..."
sleep 5

# Check container status
echo "Checking container health..."
docker-compose ps

# Show logs
echo "Showing recent logs..."
docker-compose logs --tail=50

echo ""
echo "✅ Deployment complete!"
echo "🌐 App should be available at http://your-vps-ip:3001"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"

