import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In development /api goes to the local API; in production Vercel rewrites /api to the API (vercel.json).
// Same origin in both cases, so the HttpOnly refresh cookie is first-party and no CORS is needed.
// A second copy can run side by side with its own ports: `vite --mode paralelo` reads .env.paralelo.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: Number(env.PUERTO_WEB ?? 5173),
      strictPort: true,
      proxy: { '/api': { target: env.API_LOCAL ?? 'http://localhost:8080', changeOrigin: true } },
    },
    // Unit tests only; the Playwright specs in e2e/ run with `npm run e2e`.
    test: { environment: 'node', include: ['src/**/*.test.ts'] },
  };
});
