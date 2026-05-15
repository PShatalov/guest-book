import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { applyServerEnv } from './config/env';
import { readE2eRuntime } from './config/runtime';

const monorepoRoot = path.resolve(__dirname, '../..');
const testDbStatePath = path.join(monorepoRoot, '.test-db-state.json');

type TestDatabaseState = {
  databaseUrl: string;
  sessionSecret: string;
};

export default async function globalSetup(): Promise<void> {
  execSync('pnpm --filter @guest-book/api run test:db:setup', {
    cwd: monorepoRoot,
    stdio: 'inherit',
  });

  if (!existsSync(testDbStatePath)) {
    throw new Error(
      'E2E global setup expected .test-db-state.json after test:db:setup.',
    );
  }

  const state = JSON.parse(
    readFileSync(testDbStatePath, 'utf8'),
  ) as TestDatabaseState;

  if (!state.databaseUrl || !state.sessionSecret) {
    throw new Error(
      'E2E global setup requires databaseUrl and sessionSecret in .test-db-state.json.',
    );
  }

  const runtime = readE2eRuntime();
  applyServerEnv({
    ...runtime,
    databaseUrl: state.databaseUrl,
    sessionSecret: state.sessionSecret,
  });
}
