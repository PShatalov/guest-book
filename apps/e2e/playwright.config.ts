import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

import { applyServerEnv, loadE2eEnv } from './config/env';
import { loadOrCreateE2eRuntime } from './config/runtime';
import {
  shouldReuseServers,
  toProbeUrl,
  useExternalServers,
} from './config/servers';

const monorepoRoot = path.resolve(__dirname, '../..');

loadE2eEnv();
// Port cleanup runs in pretest:e2e (scripts/free-e2e-ports.sh). Do not call
// freeE2ePorts() here — Playwright workers reload this config and would kill
// the webServer processes started for the run.

const e2eRuntime = loadOrCreateE2eRuntime();
applyServerEnv(e2eRuntime);

console.log(
  `[e2e] web ${e2eRuntime.baseURL} → API ${e2eRuntime.apiBaseURL} (test DB on 5433)`,
);

const { baseURL, apiBaseURL, webPort } = e2eRuntime;
const reuseServers = shouldReuseServers();
const externalServers = useExternalServers();

export default defineConfig({
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',
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
  ...(externalServers
    ? {}
    : {
        webServer: [
          {
            command: 'pnpm --filter @guest-book/api dev',
            cwd: monorepoRoot,
            url: `${toProbeUrl(apiBaseURL)}/health`,
            reuseExistingServer: reuseServers,
            timeout: 120_000,
          },
          {
            command: `pnpm --filter @guest-book/web exec next dev --port ${webPort}`,
            cwd: monorepoRoot,
            url: toProbeUrl(baseURL),
            reuseExistingServer: reuseServers,
            timeout: 120_000,
          },
        ],
      }),
});
