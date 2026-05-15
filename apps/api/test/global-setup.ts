import { setupTestDatabase } from './support/setup-test-database';
import type { TestDatabaseState } from './support/setup-test-database';

export default async function globalSetup(): Promise<void> {
  process.env.OTEL_SDK_DISABLED = 'true';
  const state: TestDatabaseState = await setupTestDatabase();
  process.env.DATABASE_URL = state.databaseUrl;
  process.env.SESSION_SECRET = state.sessionSecret;
}
