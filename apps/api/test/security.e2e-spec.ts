import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './support/create-test-app';

describe('Security middleware (e2e)', () => {
  let app: INestApplication<App>;
  const previousThrottleLimit = process.env.THROTTLE_LIMIT;

  afterEach(async () => {
    if (previousThrottleLimit === undefined) {
      delete process.env.THROTTLE_LIMIT;
    } else {
      process.env.THROTTLE_LIMIT = previousThrottleLimit;
    }
    if (app) {
      await app.close();
    }
  });

  it('sets helmet security headers on GET /health', async () => {
    app = await createTestApp({ withSession: false });

    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-content-type-options']).toBe('nosniff');
        expect(res.headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/i);
      });
  });

  it('returns 429 when the default throttle limit is exceeded', async () => {
    process.env.THROTTLE_LIMIT = '2';
    app = await createTestApp({ withSession: false });

    const server = app.getHttpServer();
    await request(server).get('/users/username-suggest?q=ab').expect(200);
    await request(server).get('/users/username-suggest?q=ab').expect(200);
    await request(server)
      .get('/users/username-suggest?q=ab')
      .expect(429)
      .expect((res) => {
        expect(res.body).toMatchObject({
          statusCode: 429,
          message: expect.any(String),
        });
      });
  });

  it('does not rate-limit GET /health when other routes are throttled', async () => {
    process.env.THROTTLE_LIMIT = '1';
    app = await createTestApp({ withSession: false });

    const server = app.getHttpServer();
    await request(server).get('/users/username-suggest?q=ab').expect(200);
    await request(server).get('/users/username-suggest?q=ab').expect(429);

    for (let i = 0; i < 3; i++) {
      await request(server).get('/health').expect(200);
    }
  });
});
