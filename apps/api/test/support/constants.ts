import path from 'node:path';

export const REPO_ROOT = path.resolve(__dirname, '../../../..');

export const TEST_COMPOSE_FILE = 'docker-compose.test.yml';
export const TEST_ENV_FILE = 'compose.test.env.example';
export const TEST_DB_STATE_FILE = '.test-db-state.json';

export const TEST_SESSION_SECRET =
  'test-session-secret-for-e2e-only-not-for-production';

export const TEST_MIGRATION_PATHS = [
  path.join(REPO_ROOT, 'apps/api/drizzle/0000_create_users.sql'),
  path.join(REPO_ROOT, 'apps/api/drizzle/0001_create_messages.sql'),
  path.join(REPO_ROOT, 'apps/api/drizzle/0002_create_message_feed_view.sql'),
];

export const TEST_TABLES_TO_TRUNCATE = [
  'session',
  'messages',
  'users',
] as const;

export const DEFAULT_TEST_DB = {
  user: 'guestbook_test',
  password: 'test',
  database: 'guestbook_test',
  port: '5433',
} as const;
