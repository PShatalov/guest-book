import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { configureSessionMiddleware } from '../src/common/session/configure-session.middleware';
import { TestDatabaseCleaner } from './support/test-database-cleaner';

async function createTestApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  configureSessionMiddleware(app);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.init();
  return app;
}

async function registerUser(
  app: INestApplication<App>,
  username: string,
  password = 'Str0ng!pass',
) {
  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ username, password })
    .expect(201);
}

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  const databaseUrl = process.env.DATABASE_URL as string;
  const cleaner = new TestDatabaseCleaner();

  beforeEach(async () => {
    await cleaner.truncateTables(databaseUrl);
    app = await createTestApp();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    await cleaner.truncateTables(databaseUrl);
  });

  describe('GET /users/username-suggest', () => {
    it('returns matching usernames in ascending order without authentication', async () => {
      const runId = Date.now();
      const prefix = `suggest_${runId}`;
      const alpha = `${prefix}_alpha`;
      const beta = `${prefix}_beta`;
      const zebra = `${prefix}_zebra`;

      await registerUser(app, zebra);
      await registerUser(app, alpha);
      await registerUser(app, beta);

      const response = await request(app.getHttpServer())
        .get('/users/username-suggest')
        .query({ q: prefix })
        .expect(200);

      expect(response.body.items).toEqual([alpha, beta, zebra]);
    });

    it('respects the limit query parameter', async () => {
      const sharedPrefix = `limit_${Date.now()}`;
      await registerUser(app, `${sharedPrefix}_a`);
      await registerUser(app, `${sharedPrefix}_b`);
      await registerUser(app, `${sharedPrefix}_c`);

      const response = await request(app.getHttpServer())
        .get('/users/username-suggest')
        .query({ q: sharedPrefix, limit: 2 })
        .expect(200);

      expect(response.body.items).toHaveLength(2);
    });

    it('returns 400 for an empty query', async () => {
      await request(app.getHttpServer())
        .get('/users/username-suggest')
        .query({ q: '' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining(['q must not be empty']),
          );
        });
    });

    it('returns 400 for a whitespace-only query', async () => {
      await request(app.getHttpServer())
        .get('/users/username-suggest')
        .query({ q: '   ' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining(['q must not be empty']),
          );
        });
    });

    it('returns 400 when query exceeds 64 characters', async () => {
      await request(app.getHttpServer())
        .get('/users/username-suggest')
        .query({ q: 'a'.repeat(65) })
        .expect(400)
        .expect((res) => {
          expect(res.body.statusCode).toBe(400);
          expect(res.body.message).toEqual(expect.any(Array));
        });
    });

    it('returns 400 for an invalid limit', async () => {
      await request(app.getHttpServer())
        .get('/users/username-suggest')
        .query({ q: 'any', limit: 0 })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining(['limit must not be less than 1']),
          );
        });

      await request(app.getHttpServer())
        .get('/users/username-suggest')
        .query({ q: 'any', limit: 51 })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining(['limit must not be greater than 50']),
          );
        });
    });

    it('treats SQL wildcard characters in the prefix literally', async () => {
      const runId = Date.now();
      const literalUsername = `wild%_${runId}`;
      const otherUsername = `wildx_${runId}`;
      await registerUser(app, literalUsername);
      await registerUser(app, otherUsername);

      const response = await request(app.getHttpServer())
        .get('/users/username-suggest')
        .query({ q: `wild%_${runId}` })
        .expect(200);

      expect(response.body.items).toEqual([literalUsername]);
    });
  });
});
