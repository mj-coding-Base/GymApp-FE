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

# Fix lightningcss native binary issue
# Ensure we have the correct native binary for linux-x64-gnu (Debian glibc)
RUN echo "Checking current lightningcss installation..." && \
    ls node_modules/lightningcss/ 2>/dev/null || echo "lightningcss not found" && \
    echo "Installing latest lightningcss with proper binaries..." && \
    npm install lightningcss@latest --no-save --legacy-peer-deps && \
    echo "Verifying lightningcss binaries..." && \
    ls -la node_modules/lightningcss/linux-x64-gnu/ 2>/dev/null && \
    echo "✓ lightningcss ready for build"

# Build the application
RUN npm run build

# Verify lightningcss binaries after build
RUN find . -name "*.node" -path "*/lightningcss/*" -ls || echo "Checking lightningcss binaries..."

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

# Verify lightningcss binary exists
RUN if [ -f "./node_modules/lightningcss/linux-x64-gnu/lightningcss.linux-x64-gnu.node" ]; then \
      echo "✓ lightningcss binary found"; \
    else \
      echo "✗ lightningcss binary NOT found - checking..."; \
      find ./node_modules -name "*lightningcss*.node" -ls || echo "No lightningcss binaries found"; \
    fi

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); const options = { hostname: 'localhost', port: 3002, path: '/', method: 'GET' }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Start the application
CMD ["node", "server.js"]
