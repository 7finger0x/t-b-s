import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '.next/',
        'foundry/',
        'ponder/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@coinbase/onchainkit/frame': path.resolve(__dirname, './src/test/mocks/onchainkit-frame.ts'),
      'server-only': path.resolve(__dirname, './src/test/mocks/server-only.ts'),
    },
  },
});
