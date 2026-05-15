import { teardownTestDatabase } from './support/teardown-test-database';

export default async function globalTeardown(): Promise<void> {
  await teardownTestDatabase();
}
