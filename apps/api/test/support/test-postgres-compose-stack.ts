import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  DEFAULT_TEST_DB,
  REPO_ROOT,
  TEST_COMPOSE_FILE,
  TEST_ENV_FILE,
} from './constants';

function parseEnvFile(envPath: string): Record<string, string> {
  const contents = readFileSync(envPath, 'utf8');
  const values: Record<string, string> = {};

  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    values[key] = value;
  }

  return values;
}

function assertDockerAvailable(): void {
  try {
    execSync('docker compose version', { stdio: 'pipe' });
  } catch {
    throw new Error(
      'Docker Compose is required for database E2E tests. Install Docker Engine and ensure `docker compose` is on PATH.',
    );
  }
}

const TEST_COMPOSE_PROJECT = 'guestbook-test';

export class TestPostgresComposeStack {
  private readonly composeFilePath: string;
  private readonly envFilePath: string;
  private readonly env: Record<string, string>;

  constructor(
    repoRoot: string = REPO_ROOT,
    composeFileName: string = TEST_COMPOSE_FILE,
    envFileName: string = TEST_ENV_FILE,
  ) {
    this.composeFilePath = path.join(repoRoot, composeFileName);
    this.envFilePath = path.join(repoRoot, envFileName);
    this.env = parseEnvFile(this.envFilePath);
  }

  buildDatabaseUrl(): string {
    const user = this.env.POSTGRES_USER ?? DEFAULT_TEST_DB.user;
    const password = this.env.POSTGRES_PASSWORD ?? DEFAULT_TEST_DB.password;
    const database = this.env.POSTGRES_DB ?? DEFAULT_TEST_DB.database;
    const port = this.env.POSTGRES_PORT ?? DEFAULT_TEST_DB.port;
    return `postgresql://${user}:${password}@127.0.0.1:${port}/${database}`;
  }

  start(): string {
    assertDockerAvailable();
    execSync(
      `docker compose -p ${TEST_COMPOSE_PROJECT} -f "${this.composeFilePath}" --env-file "${this.envFilePath}" up -d --wait`,
      { cwd: REPO_ROOT, stdio: 'inherit' },
    );
    return this.buildDatabaseUrl();
  }

  stop(): void {
    try {
      execSync(
        `docker compose -p ${TEST_COMPOSE_PROJECT} -f "${this.composeFilePath}" --env-file "${this.envFilePath}" down -v --remove-orphans`,
        { cwd: REPO_ROOT, stdio: 'inherit' },
      );
    } catch {
      // Teardown is best-effort when Docker was never started.
    }
  }
}
