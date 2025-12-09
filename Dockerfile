
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
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port
EXPOSE 3002

# Copy standalone output (includes all necessary files and node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Note: Runtime dependencies are included in standalone output

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); const options = { hostname: 'localhost', port: 3002, path: '/', method: 'GET' }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Start the application
CMD ["node", "server.js"]
