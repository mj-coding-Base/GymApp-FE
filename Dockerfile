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

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM node:20-slim AS builder
WORKDIR /app

# Install curl for downloading binaries
RUN apt-get update && apt-get install -y curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Fix lightningcss - The most reliable fix for native binary issues
RUN echo "=== FIXING LIGHTNINGCSS BINARY ===" && \
    echo "Checking current structure..." && \
    find node_modules/lightningcss -name "*.node" -ls 2>/dev/null || echo "No binaries found yet" && \
    echo "" && \
    echo "Checking where lightningcss expects the binary..." && \
    grep -r "require.*lightningcss.*\.node" node_modules/lightningcss/node/ 2>/dev/null || true && \
    echo "" && \
    echo "Attempting multiple fix strategies..." && \
    \
    # Strategy 1: Copy from linux-x64-gnu subdirectory to parent
    (if [ -f "node_modules/lightningcss/linux-x64-gnu/lightningcss.linux-x64-gnu.node" ]; then \
      echo "Strategy 1: Copying from linux-x64-gnu subdirectory..." && \
      cp node_modules/lightningcss/linux-x64-gnu/lightningcss.linux-x64-gnu.node \
         node_modules/lightningcss/lightningcss.linux-x64-gnu.node && \
      echo "✓ Copied to parent directory"; \
    fi) && \
    \
    # Strategy 2: Reinstall lightningcss
    echo "Strategy 2: Reinstalling lightningcss..." && \
    (cd node_modules/lightningcss && npm install 2>&1 || true) && \
    \
    # Strategy 3: Manual download if needed
    echo "Strategy 3: Checking if manual download needed..." && \
    (if [ ! -f "node_modules/lightningcss/lightningcss.linux-x64-gnu.node" ]; then \
      echo "Downloading binary manually..." && \
      cd node_modules/lightningcss && \
      mkdir -p linux-x64-gnu && \
      curl -fsSL https://github.com/parcel-bundler/lightningcss/releases/latest/download/lightningcss-linux-x64-gnu.tar.gz | tar -xz -C linux-x64-gnu/ 2>/dev/null || true && \
      cp linux-x64-gnu/lightningcss.linux-x64-gnu.node lightningcss.linux-x64-gnu.node 2>/dev/null || true; \
    fi) && \
    \
    echo "" && \
    echo "=== FINAL CHECK ===" && \
    find node_modules/lightningcss -name "*.node" -ls && \
    echo "✓ LightningCSS fix complete"

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
