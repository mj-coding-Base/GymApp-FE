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

# Fix lightningcss binary location
RUN echo "=== Fixing lightningcss binary ===" && \
    if [ -f "node_modules/lightningcss/linux-x64-gnu/lightningcss.linux-x64-gnu.node" ]; then \
      cp node_modules/lightningcss/linux-x64-gnu/lightningcss.linux-x64-gnu.node \
         node_modules/lightningcss/lightningcss.linux-x64-gnu.node && \
      echo "✓ Copied lightningcss binary to expected location"; \
    fi && \
    echo "Verifying binary..." && \
    ls -la node_modules/lightningcss/*.node 2>/dev/null || echo "No binary found"

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
