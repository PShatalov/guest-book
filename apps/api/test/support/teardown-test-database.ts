import { existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';

import { REPO_ROOT, TEST_DB_STATE_FILE } from './constants';
import { TestPostgresComposeStack } from './test-postgres-compose-stack';

export async function teardownTestDatabase(): Promise<void> {
  const statePath = path.join(REPO_ROOT, TEST_DB_STATE_FILE);

  if (existsSync(statePath)) {
    unlinkSync(statePath);
  }

  const stack = new TestPostgresComposeStack();
  stack.stop();
}
