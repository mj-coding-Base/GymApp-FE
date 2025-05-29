# Install dependencies and build the Next.js app
FROM node:18-alpine as build
WORKDIR /app

# Copy all files to the container
COPY . .

# Install dependencies using Yarn
RUN yarn install --frozen-lockfile

# Build the Next.js application
RUN yarn build

# Production image
FROM node:18-alpine
WORKDIR /app

# Copy the necessary files from the build stage
COPY --from=build /app/.next /app/.next
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/public /app/public
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/yarn.lock /app/yarn.lock
COPY --from=build /app/next.config.ts /app/next.config.ts

# Install production dependencies (if needed)
RUN yarn install --production --frozen-lockfile

# Expose the port on which the app will run
ENV PORT 8080
ENV HOST 0.0.0.0
EXPOSE 8080

# Start the Next.js application using Yarn
CMD ["yarn", "start"]
