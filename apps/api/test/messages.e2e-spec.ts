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
      .expect(400)
      .expect((res) => {
        expect(res.body.statusCode).toBe(400);
        expect(res.body.message).toEqual(expect.any(Array));
      });
  });

  it('returns 400 when category tag exceeds 32 characters', async () => {
    const agent = await registerAndLogin(app, uniqueUsername('long_tag'));

    await agent
      .post('/messages')
      .send({ text: 'Hello', categoryTag: 'a'.repeat(33) })
      .expect(400)
      .expect((res) => {
        expect(res.body.statusCode).toBe(400);
        expect(res.body.message).toEqual(expect.any(Array));
      });
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

  describe('GET /messages', () => {
    async function seedMessages(
      agent: Awaited<ReturnType<typeof registerAndLogin>>,
      entries: Array<{ text: string; categoryTag: string }>,
    ) {
      for (const entry of entries) {
        await agent.post('/messages').send(entry).expect(201);
      }
    }

    it('returns messages newest-first without authentication', async () => {
      const agent = await registerAndLogin(app, uniqueUsername('list_author'));
      await seedMessages(agent, [
        { text: 'Older post', categoryTag: 'general' },
        { text: 'Newer post', categoryTag: 'news' },
      ]);

      const response = await request(app.getHttpServer())
        .get('/messages')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].text).toBe('Newer post');
      expect(response.body.items[1].text).toBe('Older post');
      expect(response.body.items[0]).toMatchObject({
        id: expect.any(String),
        categoryTag: 'news',
        authorUsername: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it('paginates with limit and cursor', async () => {
      const agent = await registerAndLogin(
        app,
        uniqueUsername('paginate_author'),
      );
      await seedMessages(agent, [
        { text: 'Third', categoryTag: 'general' },
        { text: 'Second', categoryTag: 'general' },
        { text: 'First', categoryTag: 'general' },
      ]);

      const firstPage = await request(app.getHttpServer())
        .get('/messages')
        .query({ limit: 2 })
        .expect(200);

      expect(firstPage.body.items).toHaveLength(2);
      expect(firstPage.body.hasMore).toBe(true);
      expect(firstPage.body.nextCursor).toEqual(expect.any(String));

      const secondPage = await request(app.getHttpServer())
        .get('/messages')
        .query({ limit: 2, cursor: firstPage.body.nextCursor })
        .expect(200);

      expect(secondPage.body.items).toHaveLength(1);
      expect(secondPage.body.hasMore).toBe(false);
      expect(secondPage.body.nextCursor).toBeNull();
    });

    it('filters by category tag', async () => {
      const agent = await registerAndLogin(
        app,
        uniqueUsername('filter_author'),
      );
      await seedMessages(agent, [
        { text: 'General note', categoryTag: 'general' },
        { text: 'News note', categoryTag: 'news' },
      ]);

      const response = await request(app.getHttpServer())
        .get('/messages')
        .query({ categoryTag: ' News ' })
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toMatchObject({
        text: 'News note',
        categoryTag: 'news',
      });
    });

    it('includes a newly created message after POST', async () => {
      const agent = await registerAndLogin(
        app,
        uniqueUsername('post_then_list'),
      );
      const created = await agent
        .post('/messages')
        .send({ text: 'Fresh entry', categoryTag: 'general' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/messages')
        .expect(200);

      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: created.body.id, text: 'Fresh entry' }),
        ]),
      );
    });

    it('returns 400 for an invalid limit', async () => {
      await request(app.getHttpServer())
        .get('/messages')
        .query({ limit: 0 })
        .expect(400)
        .expect((res) => {
          expect(res.body.statusCode).toBe(400);
          expect(res.body.message).toEqual(expect.any(Array));
        });

      await request(app.getHttpServer())
        .get('/messages')
        .query({ limit: 51 })
        .expect(400)
        .expect((res) => {
          expect(res.body.statusCode).toBe(400);
          expect(res.body.message).toEqual(expect.any(Array));
        });
    });

    it('returns 400 for an invalid cursor', async () => {
      await request(app.getHttpServer())
        .get('/messages')
        .query({ cursor: 'not-valid' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining(['cursor is invalid']),
          );
        });
    });

    it('returns 400 for an empty category tag filter', async () => {
      await request(app.getHttpServer())
        .get('/messages')
        .query({ categoryTag: '' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining(['categoryTag must not be empty']),
          );
        });

      await request(app.getHttpServer())
        .get('/messages')
        .query({ categoryTag: '   ' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining(['categoryTag must not be empty']),
          );
        });
    });

    it('returns 400 when category tag filter exceeds 32 characters', async () => {
      await request(app.getHttpServer())
        .get('/messages')
        .query({ categoryTag: 'a'.repeat(33) })
        .expect(400)
        .expect((res) => {
          expect(res.body.statusCode).toBe(400);
          expect(res.body.message).toEqual(expect.any(Array));
        });
    });
  });
});
