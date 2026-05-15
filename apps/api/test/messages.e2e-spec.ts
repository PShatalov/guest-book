import { INestApplication } from '@nestjs/common';
import { Pool } from 'pg';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './support/create-test-app';
import { TestDatabaseCleaner } from './support/test-database-cleaner';

function uniqueUsername(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
    async function setMessageCreatedAt(
      messageId: string,
      createdAt: string,
    ): Promise<void> {
      const pool = new Pool({ connectionString: databaseUrl });

      try {
        await pool.query(
          `UPDATE messages SET created_at = $1::timestamptz WHERE id = $2::uuid`,
          [createdAt, messageId],
        );
        await pool.query(`REFRESH MATERIALIZED VIEW "message_feed"`);
      } finally {
        await pool.end();
      }
    }

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

    it('filters by author username case-insensitively', async () => {
      const authorUsername = uniqueUsername('filter_by_user');
      const otherUsername = uniqueUsername('filter_other_user');
      const authorAgent = await registerAndLogin(app, authorUsername);
      const otherAgent = await registerAndLogin(app, otherUsername);

      await authorAgent
        .post('/messages')
        .send({ text: 'From target author', categoryTag: 'general' })
        .expect(201);
      await otherAgent
        .post('/messages')
        .send({ text: 'From someone else', categoryTag: 'general' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/messages')
        .query({ authorUsername: ` ${authorUsername.toUpperCase()} ` })
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toMatchObject({
        text: 'From target author',
        authorUsername,
      });
    });

    it('returns 400 for an empty author username filter', async () => {
      await request(app.getHttpServer())
        .get('/messages')
        .query({ authorUsername: '' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining(['authorUsername must not be empty']),
          );
        });

      await request(app.getHttpServer())
        .get('/messages')
        .query({ authorUsername: '   ' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining(['authorUsername must not be empty']),
          );
        });
    });

    it('returns 400 when author username filter exceeds 64 characters', async () => {
      await request(app.getHttpServer())
        .get('/messages')
        .query({ authorUsername: 'a'.repeat(65) })
        .expect(400)
        .expect((res) => {
          expect(res.body.statusCode).toBe(400);
          expect(res.body.message).toEqual(expect.any(Array));
        });
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

    it('filters by createdFrom and createdTo bounds', async () => {
      const agent = await registerAndLogin(
        app,
        uniqueUsername('date_filter_author'),
      );

      const oldest = await agent
        .post('/messages')
        .send({ text: 'Oldest post', categoryTag: 'general' })
        .expect(201);
      const middle = await agent
        .post('/messages')
        .send({ text: 'Middle post', categoryTag: 'news' })
        .expect(201);
      const newest = await agent
        .post('/messages')
        .send({ text: 'Newest post', categoryTag: 'general' })
        .expect(201);

      const oldestAt = '2026-05-15T10:00:00.000Z';
      const middleAt = '2026-05-15T12:00:00.000Z';
      const newestAt = '2026-05-15T14:00:00.000Z';

      await setMessageCreatedAt(oldest.body.id, oldestAt);
      await setMessageCreatedAt(middle.body.id, middleAt);
      await setMessageCreatedAt(newest.body.id, newestAt);

      const windowed = await request(app.getHttpServer())
        .get('/messages')
        .query({ createdFrom: middleAt, createdTo: middleAt })
        .expect(200);

      expect(windowed.body.items).toHaveLength(1);
      expect(windowed.body.items[0]).toMatchObject({
        id: middle.body.id,
        text: 'Middle post',
      });

      const lowerOnly = await request(app.getHttpServer())
        .get('/messages')
        .query({ createdFrom: middleAt })
        .expect(200);

      expect(
        lowerOnly.body.items.map((item: { id: string }) => item.id),
      ).toEqual(expect.arrayContaining([middle.body.id, newest.body.id]));
      expect(
        lowerOnly.body.items.map((item: { id: string }) => item.id),
      ).not.toContain(oldest.body.id);

      const upperOnly = await request(app.getHttpServer())
        .get('/messages')
        .query({ createdTo: middleAt })
        .expect(200);

      expect(
        upperOnly.body.items.map((item: { id: string }) => item.id),
      ).toEqual(expect.arrayContaining([oldest.body.id, middle.body.id]));
      expect(
        upperOnly.body.items.map((item: { id: string }) => item.id),
      ).not.toContain(newest.body.id);
    });

    it('composes date bounds with category tag and pagination', async () => {
      const agent = await registerAndLogin(
        app,
        uniqueUsername('date_tag_paginate'),
      );

      const first = await agent
        .post('/messages')
        .send({ text: 'General one', categoryTag: 'general' })
        .expect(201);
      const second = await agent
        .post('/messages')
        .send({ text: 'News one', categoryTag: 'news' })
        .expect(201);
      const third = await agent
        .post('/messages')
        .send({ text: 'General two', categoryTag: 'general' })
        .expect(201);

      const rangeStart = '2026-05-15T10:00:00.000Z';
      const rangeMiddle = '2026-05-15T12:00:00.000Z';
      const rangeEnd = '2026-05-15T14:00:00.000Z';

      await setMessageCreatedAt(first.body.id, rangeStart);
      await setMessageCreatedAt(second.body.id, rangeMiddle);
      await setMessageCreatedAt(third.body.id, rangeEnd);

      const firstPage = await request(app.getHttpServer())
        .get('/messages')
        .query({
          createdFrom: rangeStart,
          createdTo: rangeEnd,
          categoryTag: 'general',
          limit: 1,
        })
        .expect(200);

      expect(firstPage.body.items).toHaveLength(1);
      expect(firstPage.body.items[0].categoryTag).toBe('general');
      expect(firstPage.body.hasMore).toBe(true);

      const secondPage = await request(app.getHttpServer())
        .get('/messages')
        .query({
          createdFrom: rangeStart,
          createdTo: rangeEnd,
          categoryTag: 'general',
          limit: 1,
          cursor: firstPage.body.nextCursor,
        })
        .expect(200);

      expect(secondPage.body.items).toHaveLength(1);
      expect(secondPage.body.items[0].categoryTag).toBe('general');
      expect(secondPage.body.items[0].id).not.toBe(firstPage.body.items[0].id);
    });

    it('returns 400 when createdFrom is after createdTo', async () => {
      await request(app.getHttpServer())
        .get('/messages')
        .query({
          createdFrom: '2026-05-16T12:00:00.000Z',
          createdTo: '2026-05-15T12:00:00.000Z',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining(['createdFrom must not be after createdTo']),
          );
        });
    });

    it('returns 400 for malformed date-time bounds', async () => {
      await request(app.getHttpServer())
        .get('/messages')
        .query({ createdFrom: 'not-a-date' })
        .expect(400)
        .expect((res) => {
          expect(res.body.statusCode).toBe(400);
          expect(res.body.message).toEqual(expect.any(Array));
        });

      await request(app.getHttpServer())
        .get('/messages')
        .query({ createdTo: '2026-13-40T25:99:99.000Z' })
        .expect(400)
        .expect((res) => {
          expect(res.body.statusCode).toBe(400);
          expect(res.body.message).toEqual(expect.any(Array));
        });
    });

    it('returns 400 for empty or whitespace-only date-time bounds', async () => {
      await request(app.getHttpServer())
        .get('/messages')
        .query({ createdFrom: '' })
        .expect(400)
        .expect((res) => {
          expect(res.body.statusCode).toBe(400);
          expect(res.body.message).toEqual(expect.any(Array));
        });

      await request(app.getHttpServer())
        .get('/messages')
        .query({ createdTo: '   ' })
        .expect(400)
        .expect((res) => {
          expect(res.body.statusCode).toBe(400);
          expect(res.body.message).toEqual(expect.any(Array));
        });
    });

    it('allows unauthenticated list requests with date bounds', async () => {
      const agent = await registerAndLogin(
        app,
        uniqueUsername('public_date_bounds'),
      );
      const created = await agent
        .post('/messages')
        .send({ text: 'Public read', categoryTag: 'general' })
        .expect(201);

      await request(app.getHttpServer())
        .get('/messages')
        .query({
          createdFrom: '2020-01-01T00:00:00.000Z',
          createdTo: '2030-01-01T00:00:00.000Z',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: created.body.id }),
            ]),
          );
        });
    });
  });

  describe('PATCH /messages/:id', () => {
    async function createMessage(
      agent: Awaited<ReturnType<typeof registerAndLogin>>,
      text = 'Original text',
      categoryTag = 'general',
    ) {
      const response = await agent
        .post('/messages')
        .send({ text, categoryTag })
        .expect(201);
      return response.body as { id: string; authorUsername: string };
    }

    it('updates a message for the author', async () => {
      const agent = await registerAndLogin(app, uniqueUsername('patch_author'));
      const created = await createMessage(agent);

      const response = await agent
        .patch(`/messages/${created.id}`)
        .send({ text: 'Updated text', categoryTag: 'News' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: created.id,
        text: 'Updated text',
        categoryTag: 'news',
        authorUsername: created.authorUsername,
      });
      expect(response.body.createdAt).toEqual(expect.any(String));

      await request(app.getHttpServer())
        .get('/messages')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: created.id,
                text: 'Updated text',
                categoryTag: 'news',
              }),
            ]),
          );
        });
    });

    it('returns 401 when not authenticated', async () => {
      const agent = await registerAndLogin(app, uniqueUsername('patch_unauth'));
      const created = await createMessage(agent);

      await request(app.getHttpServer())
        .patch(`/messages/${created.id}`)
        .send({ text: 'Updated', categoryTag: 'general' })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Not authenticated');
        });
    });

    it('returns 403 when authenticated as a non-author', async () => {
      const author = await registerAndLogin(app, uniqueUsername('patch_owner'));
      const created = await createMessage(author);
      const other = await registerAndLogin(app, uniqueUsername('patch_other'));

      await other
        .patch(`/messages/${created.id}`)
        .send({ text: 'Stolen edit', categoryTag: 'general' })
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('only edit your own messages');
        });
    });

    it('returns 404 when the message does not exist', async () => {
      const agent = await registerAndLogin(
        app,
        uniqueUsername('patch_missing'),
      );

      await agent
        .patch('/messages/550e8400-e29b-41d4-a716-446655440000')
        .send({ text: 'Updated', categoryTag: 'general' })
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('Message not found');
        });
    });

    it('returns 400 for invalid body and invalid id', async () => {
      const agent = await registerAndLogin(
        app,
        uniqueUsername('patch_invalid'),
      );
      const created = await createMessage(agent);

      await agent
        .patch(`/messages/${created.id}`)
        .send({ text: '', categoryTag: 'general' })
        .expect(400)
        .expect((res) => {
          expect(res.body.statusCode).toBe(400);
          expect(res.body.message).toEqual(expect.any(Array));
        });

      await agent
        .patch(`/messages/${created.id}`)
        .send({ text: 'a'.repeat(241), categoryTag: 'general' })
        .expect(400);

      await agent
        .patch(`/messages/${created.id}`)
        .send({ text: 'Valid', categoryTag: '   ' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining(['categoryTag must not be empty']),
          );
        });

      await agent
        .patch('/messages/not-a-uuid')
        .send({ text: 'Updated', categoryTag: 'general' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Validation failed (uuid is expected)',
          );
        });
    });
  });

  describe('DELETE /messages/:id', () => {
    async function createMessage(
      agent: Awaited<ReturnType<typeof registerAndLogin>>,
    ) {
      const response = await agent
        .post('/messages')
        .send({ text: 'To delete', categoryTag: 'general' })
        .expect(201);
      return response.body as { id: string };
    }

    it('deletes a message for the author', async () => {
      const agent = await registerAndLogin(
        app,
        uniqueUsername('delete_author'),
      );
      const created = await createMessage(agent);

      await agent.delete(`/messages/${created.id}`).expect(204);

      await request(app.getHttpServer())
        .get('/messages')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).not.toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: created.id }),
            ]),
          );
        });
    });

    it('returns 401 when not authenticated', async () => {
      const agent = await registerAndLogin(
        app,
        uniqueUsername('delete_unauth'),
      );
      const created = await createMessage(agent);

      await request(app.getHttpServer())
        .delete(`/messages/${created.id}`)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Not authenticated');
        });
    });

    it('returns 403 when authenticated as a non-author', async () => {
      const author = await registerAndLogin(
        app,
        uniqueUsername('delete_owner'),
      );
      const created = await createMessage(author);
      const other = await registerAndLogin(app, uniqueUsername('delete_other'));

      await other.delete(`/messages/${created.id}`).expect(403);
    });

    it('returns 404 when the message does not exist', async () => {
      const agent = await registerAndLogin(
        app,
        uniqueUsername('delete_missing'),
      );

      await agent
        .delete('/messages/550e8400-e29b-41d4-a716-446655440000')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('Message not found');
        });
    });

    it('returns 400 for an invalid message id', async () => {
      const agent = await registerAndLogin(
        app,
        uniqueUsername('delete_invalid_id'),
      );

      await agent.delete('/messages/not-a-uuid').expect(400);
    });
  });
});
