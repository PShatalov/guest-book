import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { clearE2eRuntime } from './config/runtime';

const monorepoRoot = path.resolve(__dirname, '../..');
const testDbStatePath = path.join(monorepoRoot, '.test-db-state.json');

export default async function globalTeardown(): Promise<void> {
  if (existsSync(testDbStatePath)) {
    execSync('pnpm --filter @guest-book/api run test:db:teardown', {
      cwd: monorepoRoot,
      stdio: 'inherit',
    });
  }
  clearE2eRuntime();
}
