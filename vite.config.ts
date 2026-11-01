import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  build: {
    // The Three.js renderer is lazy-loaded; Vite's warning is based on minified bytes, not transfer size.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/@react-three/fiber/')) {
            return 'react-three-fiber';
          }

          if (id.includes('/node_modules/three/')) {
            return 'three-vendor';
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
