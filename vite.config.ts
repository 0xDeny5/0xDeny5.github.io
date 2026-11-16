import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Served from the root of https://<user>.github.io, so the base stays "/".
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test/setup.ts'],
    restoreMocks: true,
  },
});
