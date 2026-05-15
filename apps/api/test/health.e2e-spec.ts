import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './support/create-test-app';

describe('HealthCheckController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp({ withSession: false });
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health returns 200 with database not_configured when DATABASE_URL is unset', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          status: 'ok',
          service: 'guest-book-api',
          database: 'not_configured',
        });
        expect(res.body.timestamp).toEqual(expect.any(String));
      });
  });
});
