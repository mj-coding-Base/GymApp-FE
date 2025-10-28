# # ─── builder stage ──────────────────────────
# FROM node:20-slim AS builder
# WORKDIR /app

# # Install python and build tools for native dependencies
# RUN apt-get update && apt-get install -y python3 make g++ git && rm -rf /var/lib/apt/lists/*

# # Copy package files and install dependencies with npm
# COPY package.json package-lock.json* ./
# RUN npm cache clean --force
# RUN npm install --legacy-peer-deps --include=optional
# RUN npm rebuild

# # Copy all source files
# COPY . .

# # Clean build environment
# RUN rm -rf .next node_modules/.cache

# # Build the app
# ENV NEXT_TELEMETRY_DISABLED=1
# RUN npm run build

# # ─── production stage ───────────────────────
# FROM node:20-slim
# WORKDIR /app

# # Copy necessary build artifacts and dependencies
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/next.config.ts ./next.config.ts

# # Use production mode
# ENV NODE_ENV=production
# ENV PORT=3002
# EXPOSE 3002

# # Start with npm (using run to pass arguments correctly)
# CMD ["npm", "run", "start", "--", "-p", "3002"]
# ---------- builder ----------
# ---------- builder ----------
 # ---------- builder ----------
FROM node:20-bullseye AS builder
WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# install build tools
RUN apt-get update && apt-get install -y python3 build-essential git curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# copy package files for deterministic install
COPY package*.json ./

# install dependencies inside container
RUN npm ci --legacy-peer-deps --include=optional

# copy app
COPY . .

# Ensure platform-specific SWC for glibc (linux-x64-gnu)
RUN npm install --no-audit --no-fund @next/swc-linux-x64-gnu@latest || true

# Force reinstall lightningcss to ensure native binaries are present
RUN npm uninstall lightningcss || true
RUN npm install --no-audit --no-fund lightningcss@latest

# Debug: Check if lightningcss binary exists
RUN echo "---- lightningcss native binary check ----" && \
    find node_modules/lightningcss -name "*.node" -type f || echo "WARNING: No .node files found in lightningcss"

# Build
RUN npm run build

# ---------- production ----------
FROM node:20-bullseye-slim AS production
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
