import { defineConfig } from 'vite';

const API_TARGET = process.env.VITE_API_TARGET ?? 'http://localhost:8787';

export default defineConfig({
  base: '/deploy-rush/',

  server: {
    port: 5173,
    open: true,
    proxy: {
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