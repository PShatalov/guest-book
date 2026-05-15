import { writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  REPO_ROOT,
  TEST_DB_STATE_FILE,
  TEST_MIGRATION_PATHS,
  TEST_SESSION_SECRET,
} from './constants';
import { TestDatabaseMigrator } from './test-database-migrator';
import { TestPostgresComposeStack } from './test-postgres-compose-stack';

export type TestDatabaseState = {
  databaseUrl: string;
  sessionSecret: string;
};

export async function setupTestDatabase(): Promise<TestDatabaseState> {
  const stack = new TestPostgresComposeStack();
  const databaseUrl = stack.start();

  const migrator = new TestDatabaseMigrator();
  await migrator.applyMigrations(databaseUrl, TEST_MIGRATION_PATHS);

  const state: TestDatabaseState = {
    databaseUrl,
    sessionSecret: TEST_SESSION_SECRET,
  };

  writeFileSync(
    path.join(REPO_ROOT, TEST_DB_STATE_FILE),
    JSON.stringify(state, null, 2),
    'utf8',
  );

  return state;
}
