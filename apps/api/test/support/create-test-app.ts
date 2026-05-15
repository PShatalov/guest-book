import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { Logger } from 'nestjs-pino';
import { AppModule } from '../../src/app.module';
import { JsonObjectBodyPipe } from '../../src/common/pipes/json-object-body.pipe';
import { configureSecurityMiddleware } from '../../src/common/security/configure-security.middleware';
import { configureSessionMiddleware } from '../../src/common/session/configure-session.middleware';
import type { AppConfig } from '../../src/config/configuration';

export type CreateTestAppOptions = {
  withSession?: boolean;
};

export async function createTestApp(
  options: CreateTestAppOptions = {},
): Promise<INestApplication<App>> {
  const { withSession = true } = options;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication({ bufferLogs: true });
  app.useLogger(app.get(Logger));
  const configService = app.get(ConfigService<AppConfig, true>);

  configureSecurityMiddleware(app, {
    trustProxy: configService.get('trustProxy', { infer: true }),
    nodeEnv: configService.get('nodeEnv', { infer: true }),
    sessionCookieSecure: configService.get('sessionCookieSecure', {
      infer: true,
    }),
  });

  const corsOrigin = configService.get('corsOrigin', { infer: true });
  if (corsOrigin) {
    app.enableCors({
      origin: corsOrigin,
      credentials: true,
    });
  }

  if (withSession) {
    configureSessionMiddleware(app);
  }

  app.useGlobalPipes(
    new JsonObjectBodyPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );
  await app.init();
  return app;
}
