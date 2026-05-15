import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

// Hermetic browser install under playwright-core/.local-browsers (see README).
process.env.PLAYWRIGHT_BROWSERS_PATH ??= '0';

const monorepoRoot = path.resolve(__dirname, '../..');

const webAppPort = 3000;
const baseURL = `http://127.0.0.1:${webAppPort}`;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'pnpm --filter @guest-book/web dev',
    cwd: monorepoRoot,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
