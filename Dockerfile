
# Use an official Node runtime as a parent image
FROM node:20-alpine AS builder 

# Set working directory
WORKDIR /app

# Copy package manifests and lockfile
COPY package.json yarn.lock ./

# Install deps
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the Next.js app
RUN yarn build

# ------------------------------------------------------------------

# Production image
FROM node:20-alpine 

WORKDIR /app

# Only copy production artifacts
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Tell Next.js to run on port 3002
ENV PORT=3002

EXPOSE 3002

# Start the app
CMD ["yarn", "start", "-p", "3002"]

