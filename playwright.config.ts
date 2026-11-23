import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests: a real browser (the Microsoft Edge installed on Windows, so no browser download) drives the
 * app like a user. By default they run against the second local copy (web 5180 -> API 8095); to test the copy
 * started by iniciar.cmd use:  set "E2E_URL=http://localhost:5173" && npm run e2e
 * The API and MongoDB must already be running; global-setup.ts stops early with a clear message if not.
 */
const URL = process.env.E2E_URL ?? 'http://localhost:5180';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: URL,
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } }],
  webServer: URL.endsWith(':5180')
    ? { command: 'npm run dev -- --mode paralelo', url: URL, reuseExistingServer: true, timeout: 60_000 }
    : undefined,
});
