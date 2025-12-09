# syntax=docker/dockerfile:1.4
# ────────────────────────────────────────────────────────────────
# Optimized production Dockerfile for Next.js 15.3.2
# Uses BuildKit for faster builds with cache mounts
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

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install all dependencies with BuildKit cache mount for faster rebuilds
# Note: lightningcss binary will be fixed in builder stage using npm script
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --include=optional

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

# Copy package files (for scripts)
COPY package.json package-lock.json* ./

# Copy source code
# Using .dockerignore to exclude unnecessary files (faster than explicit COPY)
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Fix lightningcss binary location (simplified - use npm script)
# The fix-lightningcss script in package.json handles this more efficiently
RUN npm run fix-lightningcss || echo "Fix script completed (may have warnings)"

# Build the application
# Note: build script already runs fix-lightningcss, but we run it explicitly for safety
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
RUN echo '#!/bin/sh\n\
set -e\n\
echo "=== Starting Next.js Application ==="\n\
echo "Working directory: $(pwd)"\n\
echo "Port: ${PORT:-3002}"\n\
echo "Node version: $(node --version)"\n\
echo "Checking for server.js..."\n\
if [ ! -f "./server.js" ]; then\n\
  echo "ERROR: server.js not found!"\n\
  echo "Directory contents:"\n\
  ls -la\n\
  exit 1\n\
fi\n\
echo "✓ server.js found\n\
echo "Starting server on port ${PORT:-3002}..."\n\
exec node server.js\n\
' > /app/start.sh && chmod +x /app/start.sh && chown nextjs:nodejs /app/start.sh

# Switch to non-root user
USER nextjs

# Health check - wait longer for startup
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const http = require('http'); const options = { hostname: 'localhost', port: process.env.PORT || 3002, path: '/', method: 'GET', timeout: 5000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.on('timeout', () => { req.destroy(); process.exit(1); }); req.end();"

# Start the application using startup script
CMD ["/app/start.sh"]
