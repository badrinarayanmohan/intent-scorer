/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite powers the dev server; Vitest reuses the same config for the scorer unit tests.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
