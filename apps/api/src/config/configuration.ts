export type AppConfig = {
  port: number;
  nodeEnv: string;
  databaseUrl?: string;
  sessionSecret?: string;
  sessionCookieName: string;
  sessionCookieSecure: boolean;
  corsOrigin?: string;
  trustProxy: boolean;
  throttleTtlMs: number;
  throttleLimit: number;
  throttleAuthTtlMs: number;
  throttleAuthLimit: number;
};

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === 'true' || value === '1') {
    return true;
  }
  if (value === 'false' || value === '0') {
    return false;
  }
  return fallback;
}

function resolveSessionCookieSecure(
  nodeEnv: string,
  rawValue: string | undefined,
): boolean {
  if (rawValue === 'true' || rawValue === '1') {
    return true;
  }
  if (rawValue === 'false' || rawValue === '0') {
    return false;
  }
  return nodeEnv === 'production';
}

export default (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  return {
    port: parseInt(process.env.PORT ?? '3001', 10),
    nodeEnv,
    databaseUrl: process.env.DATABASE_URL,
    sessionSecret: process.env.SESSION_SECRET,
    sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'guestbook.sid',
    sessionCookieSecure: resolveSessionCookieSecure(
      nodeEnv,
      process.env.SESSION_COOKIE_SECURE,
    ),
    corsOrigin: process.env.CORS_ORIGIN,
    trustProxy: parseBoolean(process.env.TRUST_PROXY, false),
    throttleTtlMs: parsePositiveInt(process.env.THROTTLE_TTL_MS, 60_000),
    throttleLimit: parsePositiveInt(process.env.THROTTLE_LIMIT, 100),
    throttleAuthTtlMs: parsePositiveInt(
      process.env.THROTTLE_AUTH_TTL_MS,
      60_000,
    ),
    throttleAuthLimit: parsePositiveInt(process.env.THROTTLE_AUTH_LIMIT, 10),
  };
};
