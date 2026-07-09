# Deploy Rush leaderboard API image.
# Multi-stage: compile native deps (better-sqlite3) in a builder that has
# build tools, then ship a slim runtime with just the app + node_modules.

FROM node:22-slim AS build
WORKDIR /app
# Build tools so better-sqlite3 can compile if no prebuilt binary matches.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Run as the built-in non-root "node" user.
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 8787
CMD ["node", "src/index.js"]
