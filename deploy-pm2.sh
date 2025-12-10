#!/bin/bash
# PM2 Deployment Script for GymApp Frontend
# Usage: ./deploy-pm2.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="gymapp-fe"
APP_DIR="/srv/gymapp-fe"
NODE_ENV="production"

echo -e "${GREEN}🚀 Starting PM2 deployment for ${APP_NAME}...${NC}\n"

# Check if directory exists
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Error: Directory $APP_DIR does not exist!${NC}"
    exit 1
fi

cd "$APP_DIR"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 not found. Installing PM2...${NC}"
    npm install -g pm2
fi

# Check if git is available
if command -v git &> /dev/null; then
    echo -e "${GREEN}📥 Pulling latest changes from git...${NC}"
    git pull || echo -e "${YELLOW}⚠️  Git pull failed or not a git repository${NC}"
else
    echo -e "${YELLOW}⚠️  Git not available, skipping pull${NC}"
fi

# Create logs directory
mkdir -p logs

# Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm install --legacy-peer-deps

# Fix native binaries
echo -e "${GREEN}🔧 Fixing native binaries...${NC}"
npm run fix-lightningcss || echo -e "${YELLOW}⚠️  lightningcss fix had issues${NC}"
npm run fix-native-binaries || echo -e "${YELLOW}⚠️  native binaries fix had issues${NC}"

# Build the application
echo -e "${GREEN}🏗️  Building application...${NC}"
npm run build

# Check if ecosystem.config.cjs exists
if [ ! -f "ecosystem.config.cjs" ]; then
    echo -e "${RED}❌ Error: ecosystem.config.cjs not found!${NC}"
    exit 1
fi

# Check if app is already running
if pm2 list | grep -q "$APP_NAME"; then
    echo -e "${GREEN}🛑 Stopping existing PM2 process...${NC}"
    pm2 stop "$APP_NAME" 2>/dev/null || true
    pm2 delete "$APP_NAME" 2>/dev/null || true
    sleep 2
fi

# Check if port is in use
if command -v lsof &> /dev/null; then
    PORT_PID=$(lsof -ti:3002 2>/dev/null || true)
    if [ -n "$PORT_PID" ]; then
        echo -e "${YELLOW}⚠️  Port 3002 is in use (PID: $PORT_PID), killing it...${NC}"
        kill -9 $PORT_PID 2>/dev/null || true
        sleep 2
    fi
fi

echo -e "${GREEN}▶️  Starting new PM2 process...${NC}"
pm2 start ecosystem.config.cjs --env production

# Save PM2 process list
echo -e "${GREEN}💾 Saving PM2 process list...${NC}"
pm2 save

# Show status
echo -e "\n${GREEN}✅ Deployment complete!${NC}\n"
echo -e "${GREEN}📊 Current PM2 status:${NC}"
pm2 status

echo -e "\n${GREEN}📋 Useful commands:${NC}"
echo -e "  View logs:    ${YELLOW}pm2 logs ${APP_NAME}${NC}"
echo -e "  Monitor:      ${YELLOW}pm2 monit${NC}"
echo -e "  Restart:      ${YELLOW}pm2 restart ${APP_NAME}${NC}"
echo -e "  Stop:         ${YELLOW}pm2 stop ${APP_NAME}${NC}"

# Check if startup script is configured
if ! pm2 startup | grep -q "already setup"; then
    echo -e "\n${YELLOW}⚠️  PM2 startup script not configured.${NC}"
    echo -e "${YELLOW}   Run: ${GREEN}pm2 startup${NC} ${YELLOW}and follow the instructions${NC}"
fi

echo -e "\n${GREEN}✨ Done!${NC}\n"

