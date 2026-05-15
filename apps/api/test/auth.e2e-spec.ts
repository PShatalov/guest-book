import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './support/create-test-app';
import { TestDatabaseCleaner } from './support/test-database-cleaner';

function uniqueUsername(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

describe('AuthController (e2e)', () => {
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

  it('registers, returns session, and logs out', async () => {
    const username = uniqueUsername('register');
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/auth/register')
      .send({ username, password: 'Str0ng!pass' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ username });
      });

    await agent
      .get('/auth/session')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ username });
      });

    await agent.post('/auth/logout').expect(204);
    await agent.get('/auth/session').expect(401);
  });

  it('returns 409 when username is already taken', async () => {
    const username = uniqueUsername('duplicate');
    const password = 'Str0ng!pass';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username, password })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username, password: 'Str0ng!pass2' })
      .expect(409)
      .expect((res) => {
        expect(res.body.message).toContain('Username already exists');
      });
  });

  it('returns 400 when password policy fails', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: uniqueUsername('weak'), password: 'short' })
      .expect(400);
  });

  it('logs in with valid credentials and rejects invalid credentials', async () => {
    const username = uniqueUsername('login');
    const password = 'Str0ng!pass';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username, password })
      .expect(201);

    const loginAgent = request.agent(app.getHttpServer());
    await loginAgent
      .post('/auth/login')
      .send({ username, password })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ username });
      });

    await loginAgent.get('/auth/session').expect(200);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password: 'wrong-password' })
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toContain('Invalid credentials');
      });
  });

  it('returns 401 for session when not authenticated', async () => {
    await request(app.getHttpServer()).get('/auth/session').expect(401);
  });
});
