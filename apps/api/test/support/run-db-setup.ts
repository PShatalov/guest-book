import { setupTestDatabase } from './setup-test-database';

setupTestDatabase()
  .then((state) => {
    process.stdout.write(`${state.databaseUrl}\n`);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(1);
  });
