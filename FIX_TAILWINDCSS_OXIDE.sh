#!/bin/bash
# Quick fix for @tailwindcss/oxide native binding issue on VPS

echo "🔧 Fixing @tailwindcss/oxide native binding..."

# Install the platform-specific package
npm install --no-save --legacy-peer-deps @tailwindcss/oxide-linux-x64-gnu

# Verify installation
if [ -d "node_modules/@tailwindcss/oxide-linux-x64-gnu" ]; then
  echo "✅ @tailwindcss/oxide-linux-x64-gnu installed successfully"
else
  echo "❌ Installation failed"
  exit 1
fi

echo "✅ Fix complete! Try building again with: npm run build"

