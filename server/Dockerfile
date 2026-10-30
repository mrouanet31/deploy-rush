# Deploy Rush leaderboard API image.
# Three stages: compile TypeScript (dev deps), install native deps for
# production only (better-sqlite3, no TypeScript), then ship a slim runtime
# with just the compiled JS + prod node_modules.

FROM node:22-slim AS build
WORKDIR /app
# Build tools so better-sqlite3 can compile if no prebuilt binary matches.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package*.json tsconfig*.json ./
RUN npm ci
COPY src ./src
RUN npm run build

FROM node:22-slim AS prod-deps
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Run as the built-in non-root "node" user.
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package*.json ./
COPY --from=build /app/dist ./dist
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 8787
CMD ["node", "dist/index.js"]
