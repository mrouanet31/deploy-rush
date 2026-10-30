import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Scope to real application tests; without this, Vitest also collects
    // the .github/skills template *.test.* files (they lack their own
    // devDependencies and always fail).
    include: ['src/**/*.test.{ts,tsx}', 'server/src/**/*.test.ts']
  }
});
