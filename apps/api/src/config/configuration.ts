export type AppConfig = {
  port: number;
  nodeEnv: string;
  databaseUrl?: string;
  sessionSecret?: string;
  sessionCookieName: string;
  sessionCookieSecure: boolean;
  corsOrigin?: string;
};

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
  };
};
