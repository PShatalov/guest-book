import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { configureSessionMiddleware } from '../src/common/session/configure-session.middleware';
import { TestDatabaseCleaner } from './support/test-database-cleaner';

function uniqueUsername(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

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

async function registerAndLogin(
  app: INestApplication<App>,
  username: string,
  password = 'Str0ng!pass',
) {
  const agent = request.agent(app.getHttpServer());
  await agent.post('/auth/register').send({ username, password }).expect(201);
  return agent;
}

describe('MessagesController (e2e)', () => {
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

  it('creates a message for an authenticated user', async () => {
    const agent = await registerAndLogin(app, uniqueUsername('message_author'));

    const response = await agent
      .post('/messages')
      .send({ text: 'Hello guestbook', categoryTag: 'General' })
      .expect(201);

    expect(response.body).toMatchObject({
      text: 'Hello guestbook',
      categoryTag: 'general',
      authorUsername: expect.any(String),
    });
    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.createdAt).toEqual(expect.any(String));
  });

  it('returns 401 when not authenticated', async () => {
    await request(app.getHttpServer())
      .post('/messages')
      .send({ text: 'Hello', categoryTag: 'general' })
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toContain('Not authenticated');
      });
  });

  it('returns 400 when message text exceeds 240 characters', async () => {
    const agent = await registerAndLogin(app, uniqueUsername('long_text'));

    await agent
      .post('/messages')
      .send({ text: 'a'.repeat(241), categoryTag: 'general' })
      .expect(400);
  });

  it('returns 400 when category tag exceeds 32 characters', async () => {
    const agent = await registerAndLogin(app, uniqueUsername('long_tag'));

    await agent
      .post('/messages')
      .send({ text: 'Hello', categoryTag: 'a'.repeat(33) })
      .expect(400);
  });

  it('returns 400 when category tag is whitespace only', async () => {
    const agent = await registerAndLogin(app, uniqueUsername('blank_tag'));

    await agent
      .post('/messages')
      .send({ text: 'Hello', categoryTag: '   ' })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toEqual(
          expect.arrayContaining(['categoryTag must not be empty']),
        );
      });
  });
});
