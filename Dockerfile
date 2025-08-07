
# ─── builder stage ──────────────────────────
FROM node:20-slim AS builder
WORKDIR /app

# install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# copy source & build
COPY . .
RUN npm run build

# ─── production stage ───────────────────────
FROM node:20-slim
WORKDIR /app

# copy artifacts & prod deps
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# expose and listen on port 3002
ENV PORT=3002
EXPOSE 3002
# For development mode (temporary)
#CMD ["yarn", "dev"]
ENV NODE_ENV=production
CMD ["npm", "run", "start", "--", "-p", "3002"]
#ENV NODE_ENV=development
#CMD ["npm", "run", "dev", "--", "-p", "3002", "--hostname", "0.0.0.0"]