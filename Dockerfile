# Deploy Rush web image.
# Stage 1 builds the Vite bundle; stage 2 serves it with nginx and proxies
# /api to the leaderboard backend container.

FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Optional API key baked into the client when the backend requires auth.
ARG VITE_SUBMIT_TOKEN=""
ENV VITE_SUBMIT_TOKEN=$VITE_SUBMIT_TOKEN
RUN npm run build

FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
