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
    // Never ship sourcemaps in the public bundle (they exposed the full
    // TypeScript source). Enable locally via VITE_SOURCEMAP=true if needed.
    sourcemap: process.env.VITE_SOURCEMAP === 'true',
    rollupOptions: {
      output: {
        // Phaser dwarfs the game code; its own chunk lets browsers cache it
        // separately across game-code releases. Rolldown requires a
        // function form (the object shorthand from Rollup isn't supported).
        manualChunks(id) {
          if (id.includes('node_modules/phaser')) return 'phaser';
        }
      }
    }
  }
});
