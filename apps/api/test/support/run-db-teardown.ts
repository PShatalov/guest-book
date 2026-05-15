import { teardownTestDatabase } from './teardown-test-database';

teardownTestDatabase().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
