#!/bin/bash

# VPS Deployment Script - Fixes LightningCSS Issue
# Usage: ./deploy-vps.sh

set -e  # Exit on error

echo "🚀 Starting VPS Deployment..."
echo ""

# Change to project directory
cd /srv/gymapp-fe

echo "📥 Pulling latest changes..."
git pull

echo ""
echo "🔧 Installing dependencies (including optional for native modules)..."
npm install --legacy-peer-deps --include=optional

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🏗️  Building application..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "🚀 Starting application..."
npm start &

echo ""
echo "✅ Application started in background!"
echo "📊 Check logs with: pm2 logs (if using pm2)"
echo "   Or manually: npm start"
echo ""
echo "✅ Deployment complete! 🎉"

