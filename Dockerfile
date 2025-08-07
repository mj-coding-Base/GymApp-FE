# ─── builder stage ──────────────────────────
FROM node:20-slim AS builder
WORKDIR /app

# Install yarn explicitly to avoid fallback to npm
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Copy and install dependencies with yarn
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy all source files and build the Next.js app
COPY . .
RUN yarn build

# ─── production stage ───────────────────────
FROM node:20-slim
WORKDIR /app

# Enable yarn in runtime image as well
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Copy necessary build artifacts and dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

# Use production mode
ENV NODE_ENV=production
ENV PORT=3002
EXPOSE 3002

# Start with yarn
CMD ["yarn", "start", "-p", "3002"]
