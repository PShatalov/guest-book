import { existsSync } from 'node:fs';
import path from 'node:path';

import { config as loadDotenv } from 'dotenv';

import {
  E2E_API_PORT_CANDIDATES,
  E2E_WEB_PORT_CANDIDATES,
  resolveDefaultPorts,
  shouldReuseServers,
} from './servers';

const e2eRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(e2eRoot, '../..');

const DEFAULT_SESSION_SECRET =
  'test-session-secret-for-e2e-only-not-for-production';

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }
  loadDotenv({ path: filePath, override: false });
}

export function loadE2eEnv(): void {
  loadEnvFile(path.join(repoRoot, 'compose.test.env.example'));
  loadEnvFile(path.join(e2eRoot, '.env'));
}

function envOrDefault(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: string,
): string {
  return env[name] ?? fallback;
}

export function buildTestDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  if (env.E2E_DATABASE_URL) {
    return env.E2E_DATABASE_URL;
  }

  const user = envOrDefault(env, 'POSTGRES_USER', 'guestbook_test');
  const password = envOrDefault(env, 'POSTGRES_PASSWORD', 'test');
  const database = envOrDefault(env, 'POSTGRES_DB', 'guestbook_test');
  const port = envOrDefault(env, 'POSTGRES_PORT', '5433');
  const host = envOrDefault(env, 'POSTGRES_HOST', '127.0.0.1');
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

/** Reject dev DATABASE_URL leakage — E2E must target the isolated test Postgres. */
export function assertTestDatabaseUrl(databaseUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error(`E2E DATABASE_URL is not a valid URL: ${databaseUrl}`);
  }

  const database = parsed.pathname.replace(/^\//, '');
  const port = parsed.port || '5432';
  const isTestDatabase =
    database === 'guestbook_test' && port === '5433';

  if (!isTestDatabase) {
    const redacted = databaseUrl.replace(
      /:\/\/([^:]+):([^@]+)@/,
      '://$1:***@',
    );
    throw new Error(
      `E2E must use the isolated test database (postgresql://guestbook_test:***@127.0.0.1:5433/guestbook_test), not: ${redacted}`,
    );
  }
}

export type E2eConfig = {
  webHost: string;
  webPort: string;
  apiHost: string;
  apiPort: string;
  baseURL: string;
  apiBaseURL: string;
  databaseUrl: string;
  sessionSecret: string;
};

export function resolveE2eConfig(env: NodeJS.ProcessEnv = process.env): E2eConfig {
  const webHost = env.E2E_WEB_HOST ?? 'localhost';
  const apiHost = env.E2E_API_HOST ?? 'localhost';
  const reuseExistingServer = shouldReuseServers(env);
  const { webPort, apiPort, webPortShifted, apiPortShifted } =
    resolveDefaultPorts(env, { reuseExistingServer });

  if (webPortShifted) {
    const preferred = env.E2E_WEB_PORT ?? E2E_WEB_PORT_CANDIDATES[0];
    console.warn(
      `[e2e] E2E web port ${preferred} is in use; using ${webPort} for this run.`,
    );
  }
  if (apiPortShifted) {
    const preferred = env.E2E_API_PORT ?? E2E_API_PORT_CANDIDATES[0];
    console.warn(
      `[e2e] E2E API port ${preferred} is in use; using ${apiPort} for this run.`,
    );
  }

  const baseURL = `http://${webHost}:${webPort}`;
  const apiBaseURL = `http://${apiHost}:${apiPort}`;

  if (env.E2E_BASE_URL && env.E2E_BASE_URL !== baseURL) {
    console.warn(
      `[e2e] Ignoring E2E_BASE_URL=${env.E2E_BASE_URL} (using ${baseURL} from E2E_WEB_PORT).`,
    );
  }
  if (env.E2E_API_BASE_URL && env.E2E_API_BASE_URL !== apiBaseURL) {
    console.warn(
      `[e2e] Ignoring E2E_API_BASE_URL=${env.E2E_API_BASE_URL} (using ${apiBaseURL} from E2E_API_PORT).`,
    );
  }

  const databaseUrl = buildTestDatabaseUrl(env);
  const sessionSecret =
    env.E2E_SESSION_SECRET ?? DEFAULT_SESSION_SECRET;

  return {
    webHost,
    webPort,
    apiHost,
    apiPort,
    baseURL,
    apiBaseURL,
    databaseUrl,
    sessionSecret,
  };
}

export function applyServerEnv(
  config: E2eConfig,
  env: NodeJS.ProcessEnv = process.env,
): void {
  assertTestDatabaseUrl(config.databaseUrl);
  env.DATABASE_URL = config.databaseUrl;
  env.SESSION_SECRET = config.sessionSecret;
  env.SESSION_COOKIE_SECURE = 'false';
  env.PORT = config.apiPort;
  env.CORS_ORIGIN = config.baseURL;
  env.E2E_BASE_URL = config.baseURL;
  env.E2E_API_BASE_URL = config.apiBaseURL;
  env.E2E_WEB_PORT = config.webPort;
  env.E2E_API_PORT = config.apiPort;
  env.NEXT_PUBLIC_API_URL = '/api';
  env.API_PROXY_TARGET = config.apiBaseURL;
  env.NODE_ENV = 'development';
  env.PLAYWRIGHT_BROWSERS_PATH ??= '0';
}
