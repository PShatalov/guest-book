import type { INestApplication } from '@nestjs/common';
import type { AppConfig } from '../../config/configuration';
import helmet from 'helmet';
import hpp from 'hpp';

export type SecurityMiddlewareConfig = Pick<
  AppConfig,
  'trustProxy' | 'nodeEnv' | 'sessionCookieSecure'
>;

export function configureSecurityMiddleware(
  app: INestApplication,
  config: SecurityMiddlewareConfig,
): void {
  const expressApp = app.getHttpAdapter().getInstance();

  if (config.trustProxy) {
    expressApp.set('trust proxy', 1);
  }

  app.use(hpp());

  const enableHsts =
    config.nodeEnv === 'production' && config.sessionCookieSecure;

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      strictTransportSecurity: enableHsts
        ? { maxAge: 31_536_000, includeSubDomains: true }
        : false,
    }),
  );
}
