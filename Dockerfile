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
    FROM node:20-bullseye AS builder
    WORKDIR /app
    ENV NODE_ENV=development
    ENV NEXT_TELEMETRY_DISABLED=1
    
    # Install system build deps required for native modules
    RUN apt-get update && apt-get install -y \
        python3 build-essential git curl ca-certificates \
      && rm -rf /var/lib/apt/lists/*
    
    # Copy package files first for deterministic installs
    COPY package*.json ./
    
    # Install dependencies inside the container (reproducible)
    RUN npm ci --legacy-peer-deps --include=optional
    
    # Copy the rest of the source
    COPY . .
    
    # Ensure SWC / lightningcss binaries for this platform are present:
    # - install @next/swc platform packages
    # - force-rebuild native modules and lightningcss
    RUN npm install --no-audit --no-fund @next/swc-linux-x64-gnu@latest @next/swc-linux-x64-musl@latest || true
    RUN npm rebuild --update-binary || true
    RUN npm rebuild lightningcss --update-binary || true
    
    # Build the app
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
    