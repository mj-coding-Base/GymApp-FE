# ─── builder stage ──────────────────────────
FROM node:20-slim AS builder
WORKDIR /app

# Install python and build tools for native dependencies
RUN apt-get update && apt-get install -y python3 make g++ git && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies with npm
COPY package.json package-lock.json* ./
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --include=optional
RUN npm rebuild

# Copy all source files
COPY . .

# Clean build environment
RUN rm -rf .next node_modules/.cache

# Build the app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── production stage ───────────────────────
FROM node:20-slim
WORKDIR /app

# Copy necessary build artifacts and dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Use production mode
ENV NODE_ENV=production
ENV PORT=3002
EXPOSE 3002

# Start with npm (using run to pass arguments correctly)
CMD ["npm", "run", "start", "--", "-p", "3002"]
