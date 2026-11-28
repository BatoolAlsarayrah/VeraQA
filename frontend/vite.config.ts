import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { msw } from 'msw/vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const mock = loadEnv(mode, process.cwd(), 'VITE_').VITE_API_MODE === 'mock';

  return {
    // The mock worker is served and built only in mock mode, so live builds carry no mock code.
    plugins: [react(), tailwindcss(), mock && msw({ mode: 'worker-only' })],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // Only the tests read API.md, which is shared with the backend at the repo root, outside
    // frontend/; the dev server keeps Vite's default allow list.
    server: mode === 'test' ? { fs: { allow: ['..'] } } : {},
    test: {
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      restoreMocks: true,
      unstubGlobals: true,
    },
  };
});
