import { defineConfig } from 'vite';

const API_TARGET = process.env.VITE_API_TARGET ?? 'http://localhost:8787';
const BASE_PATH = process.env.VITE_BASE_PATH ?? '/deploy-rush/';

export default defineConfig({
  base: BASE_PATH,

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
    outDir: 'dist/deploy-rush',
    target: 'es2020',
    sourcemap: true
  }
});
