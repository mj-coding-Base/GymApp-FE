# syntax=docker/dockerfile:1
# ────────────────────────────────────────────────────────────────
# Optimized production Dockerfile for Next.js 15.3.2
# ────────────────────────────────────────────────────────────────

# =============================================================================
# Stage 1: Dependencies Installation
# =============================================================================
FROM node:20-slim AS deps
WORKDIR /app

# Install necessary build tools for native dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies and optional dependencies for native modules)
RUN npm ci --legacy-peer-deps --include=optional

# Fix lightningcss binary location immediately after installation
RUN echo "=== Fixing lightningcss in deps stage ===" && \
    if [ -d "node_modules/lightningcss" ]; then \
      echo "Checking lightningcss structure..." && \
      find node_modules/lightningcss -name "*.node" -ls 2>/dev/null || echo "No binaries found yet" && \
      BINARY_PATH=$(find node_modules/lightningcss -name "lightningcss.linux-x64-gnu.node" -type f 2>/dev/null | head -1) && \
      if [ -n "$BINARY_PATH" ] && [ -f "$BINARY_PATH" ]; then \
        cp -v "$BINARY_PATH" \
           node_modules/lightningcss/lightningcss.linux-x64-gnu.node && \
        chmod +x node_modules/lightningcss/lightningcss.linux-x64-gnu.node && \
        echo "✓ Fixed lightningcss binary in deps stage from: $BINARY_PATH"; \
      else \
        echo "⚠ Binary not found in deps stage (will be fixed in builder stage)"; \
      fi && \
      ls -la node_modules/lightningcss/*.node 2>/dev/null || echo "Binary not in expected location yet"; \
    fi

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM node:20-slim AS builder
WORKDIR /app

# Install build tools for native dependencies (if needed for recompile)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Fix lightningcss binary location - comprehensive fix with multiple strategies
RUN echo "=== Fixing lightningcss binary in builder stage ===" && \
    echo "Platform: $(uname -m) $(uname -s)" && \
    echo "Checking lightningcss installation..." && \
    if [ ! -d "node_modules/lightningcss" ]; then \
      echo "❌ ERROR: lightningcss not installed!" && exit 1; \
    fi && \
    echo "LightningCSS directory structure:" && \
    ls -la node_modules/lightningcss/ 2>/dev/null | head -20 || true && \
    echo "" && \
    echo "Searching for .node files:" && \
    find node_modules/lightningcss -name "*.node" -type f -ls 2>/dev/null || echo "No .node files found initially" && \
    echo "" && \
    # Strategy 1: Copy from subdirectory to parent if it exists
    if [ -f "node_modules/lightningcss/linux-x64-gnu/lightningcss.linux-x64-gnu.node" ]; then \
      cp -v node_modules/lightningcss/linux-x64-gnu/lightningcss.linux-x64-gnu.node \
         node_modules/lightningcss/lightningcss.linux-x64-gnu.node && \
      chmod +x node_modules/lightningcss/lightningcss.linux-x64-gnu.node && \
      echo "✓ Strategy 1: Copied from linux-x64-gnu subdirectory"; \
    fi && \
    # Strategy 2: Check nested node_modules location (lightningcss installs it here)
    if [ -f "node_modules/lightningcss/node_modules/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node" ]; then \
      cp -v node_modules/lightningcss/node_modules/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node \
         node_modules/lightningcss/lightningcss.linux-x64-gnu.node && \
      chmod +x node_modules/lightningcss/lightningcss.linux-x64-gnu.node && \
      echo "✓ Strategy 2: Copied from nested node_modules location"; \
    fi && \
    # Strategy 2b: Check other alternative locations
    for dir in "node_modules/lightningcss/"*; do \
      if [ -d "$dir" ] && [ -f "$dir/lightningcss.linux-x64-gnu.node" ]; then \
        if [ ! -f "node_modules/lightningcss/lightningcss.linux-x64-gnu.node" ]; then \
          cp -v "$dir/lightningcss.linux-x64-gnu.node" \
             "node_modules/lightningcss/lightningcss.linux-x64-gnu.node" && \
          chmod +x node_modules/lightningcss/lightningcss.linux-x64-gnu.node && \
          echo "✓ Found binary in alternative location: $dir"; \
        fi; \
      fi; \
    done && \
    # Strategy 3: Try to find in any nested lightningcss-linux-x64-gnu package
    if [ ! -f "node_modules/lightningcss/lightningcss.linux-x64-gnu.node" ]; then \
      BINARY_PATH=$(find node_modules/lightningcss -name "lightningcss.linux-x64-gnu.node" -type f 2>/dev/null | head -1) && \
      if [ -n "$BINARY_PATH" ] && [ -f "$BINARY_PATH" ]; then \
        cp -v "$BINARY_PATH" \
           node_modules/lightningcss/lightningcss.linux-x64-gnu.node && \
        chmod +x node_modules/lightningcss/lightningcss.linux-x64-gnu.node && \
        echo "✓ Strategy 3: Found and copied from: $BINARY_PATH"; \
      else \
        echo "⚠ Binary not found in any location, trying reinstall..." && \
        cd node_modules/lightningcss && \
        npm install --no-save --legacy-peer-deps --include=optional --ignore-scripts 2>&1 | head -20 || true && \
        cd ../.. && \
        BINARY_PATH_AFTER=$(find node_modules/lightningcss -name "lightningcss.linux-x64-gnu.node" -type f 2>/dev/null | head -1) && \
        if [ -n "$BINARY_PATH_AFTER" ] && [ -f "$BINARY_PATH_AFTER" ]; then \
          cp -v "$BINARY_PATH_AFTER" \
             node_modules/lightningcss/lightningcss.linux-x64-gnu.node && \
          chmod +x node_modules/lightningcss/lightningcss.linux-x64-gnu.node && \
          echo "✓ Strategy 3: Reinstalled and fixed lightningcss from: $BINARY_PATH_AFTER"; \
        else \
          echo "⚠ Reinstall did not create expected binary"; \
        fi; \
      fi; \
    fi && \
    echo "" && \
    echo "=== Final verification ===" && \
    if [ -f "node_modules/lightningcss/lightningcss.linux-x64-gnu.node" ]; then \
      ls -lh node_modules/lightningcss/lightningcss.linux-x64-gnu.node && \
      file node_modules/lightningcss/lightningcss.linux-x64-gnu.node || true && \
      echo "✓ lightningcss binary verified at expected location"; \
    else \
      echo "❌ ERROR: lightningcss binary still not found!" && \
      echo "Full directory tree:" && \
      find node_modules/lightningcss -type f -name "*.node" -o -type d -name "*x64*" 2>/dev/null | head -30 || true && \
      echo "All .node files in lightningcss:" && \
      find node_modules/lightningcss -name "*.node" -ls 2>/dev/null || true && \
      exit 1; \
    fi

# Run fix-lightningcss script explicitly before build (double-check)
RUN npm run fix-lightningcss || echo "Fix script completed (may have warnings)"

# Build the application
RUN npm run build

# =============================================================================
# Stage 3: Production Runtime
# =============================================================================
FROM node:20-slim AS runner
WORKDIR /app

# Install ca-certificates for HTTPS requests
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

# Set production environment
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port
EXPOSE 3002

# Copy standalone output (includes all necessary files and node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Verify server.js exists before switching user
RUN if [ ! -f "./server.js" ]; then \
      echo "ERROR: server.js not found! Standalone build may have failed." && \
      echo "Contents of current directory:" && \
      ls -la && \
      echo "Contents of .next directory:" && \
      ls -la .next/ 2>/dev/null || echo ".next directory not found" && \
      exit 1; \
    fi && \
    echo "✓ server.js found, build successful"

# Create startup script to handle errors gracefully
RUN cat > /app/start.sh << 'EOF' && chmod +x /app/start.sh && chown nextjs:nodejs /app/start.sh
#!/bin/sh
set -e
echo "=== Starting Next.js Application ==="
echo "Working directory: $(pwd)"
echo "Port: ${PORT:-3002}"
echo "Hostname: ${HOSTNAME:-0.0.0.0}"
echo "Node version: $(node --version)"
echo "NODE_ENV: ${NODE_ENV:-production}"
echo ""
echo "Checking for server.js..."
if [ ! -f "./server.js" ]; then
  echo "ERROR: server.js not found!"
  echo "Directory contents:"
  ls -la
  echo ""
  echo "Checking for .next directory:"
  ls -la .next/ 2>/dev/null || echo ".next directory not found"
  exit 1
fi
echo "✓ server.js found"
echo ""
echo "Verifying required directories exist..."
[ -d "./.next/static" ] && echo "✓ .next/static exists" || echo "⚠ .next/static missing"
[ -d "./public" ] && echo "✓ public exists" || echo "⚠ public missing"
[ -d "./node_modules" ] && echo "✓ node_modules exists" || echo "⚠ node_modules missing"
echo ""
echo "Starting server on ${HOSTNAME:-0.0.0.0}:${PORT:-3002}..."
# Ensure HOSTNAME and PORT are exported
export HOSTNAME=${HOSTNAME:-0.0.0.0}
export PORT=${PORT:-3002}
export NODE_ENV=${NODE_ENV:-production}
exec node server.js
EOF

# Switch to non-root user
USER nextjs

# Health check - wait longer for startup
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const http = require('http'); const options = { hostname: 'localhost', port: process.env.PORT || 3002, path: '/', method: 'GET', timeout: 5000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.on('timeout', () => { req.destroy(); process.exit(1); }); req.end();"

# Start the application using startup script
CMD ["/app/start.sh"]
