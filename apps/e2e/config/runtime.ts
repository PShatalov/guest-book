import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { resolveE2eConfig, type E2eConfig } from './env';

const repoRoot = path.resolve(__dirname, '../../..');
export const E2E_RUNTIME_FILE = path.join(repoRoot, '.e2e-runtime.json');

function isPlaywrightWorker(): boolean {
  return process.env.TEST_WORKER_INDEX !== undefined;
}

export function writeE2eRuntime(config: E2eConfig): void {
  writeFileSync(E2E_RUNTIME_FILE, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
}

export function readE2eRuntime(): E2eConfig {
  if (!existsSync(E2E_RUNTIME_FILE)) {
    throw new Error(
      `Missing ${E2E_RUNTIME_FILE}. Run Playwright from apps/e2e so the config can create it.`,
    );
  }
  return JSON.parse(readFileSync(E2E_RUNTIME_FILE, 'utf8')) as E2eConfig;
}

/** Main process resolves ports once; workers reuse that file so they match webServer. */
export function loadOrCreateE2eRuntime(): E2eConfig {
  if (isPlaywrightWorker()) {
    return readE2eRuntime();
  }
  const config = resolveE2eConfig();
  writeE2eRuntime(config);
  return config;
}

export function clearE2eRuntime(): void {
  if (existsSync(E2E_RUNTIME_FILE)) {
    unlinkSync(E2E_RUNTIME_FILE);
  }
}
