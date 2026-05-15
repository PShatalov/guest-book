import { InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import connectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import type { INestApplication } from '@nestjs/common';
import session from 'express-session';
import { Pool } from 'pg';
import type { AppConfig } from '../../config/configuration';

const logger = new Logger('SessionMiddleware');

export function configureSessionMiddleware(app: INestApplication): void {
  const configService = app.get(ConfigService<AppConfig, true>);
  const sessionSecret = configService.get('sessionSecret', { infer: true });
  const databaseUrl = configService.get('databaseUrl', { infer: true });
  const sessionCookieName = configService.get('sessionCookieName', {
    infer: true,
  });
  const sessionCookieSecure = configService.get('sessionCookieSecure', {
    infer: true,
  });

  if (!sessionSecret) {
    throw new InternalServerErrorException(
      'SESSION_SECRET is required for authentication',
    );
  }

  if (!databaseUrl) {
    throw new InternalServerErrorException(
      'DATABASE_URL is required for session persistence',
    );
  }

  const PgSession = connectPgSimple(session);
  const pool = new Pool({ connectionString: databaseUrl });

  app.use(cookieParser());
  app.use(
    session({
      name: sessionCookieName,
      store: new PgSession({
        pool,
        tableName: 'session',
        createTableIfMissing: true,
      }),
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: sessionCookieSecure,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );

  logger.log('Session middleware configured with PostgreSQL store');
}
