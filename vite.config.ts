import { defineConfig } from 'vite';

const API_TARGET = process.env.VITE_API_TARGET ?? 'http://localhost:8787';

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Proxy API calls to the leaderboard backend during development.
      '/api': {
        target: API_TARGET,
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'es2020',
    sourcemap: true
  }
});
