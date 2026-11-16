import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Served from the root of https://<user>.github.io, so the base stays "/".
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
  },
});
