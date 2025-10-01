# ─── builder stage ──────────────────────────
FROM node:20-slim AS builder
WORKDIR /app

# Copy package files and install dependencies with npm
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy all source files and build the Next.js app
COPY . .
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
