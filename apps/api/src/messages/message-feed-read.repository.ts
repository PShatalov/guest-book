import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import type { DrizzleClient } from '../database/drizzle.provider';
import { DRIZZLE } from '../database/drizzle.constants';

export type MessageFeedRow = {
  id: string;
  text: string;
  categoryTag: string;
  authorUsername: string;
  createdAt: Date;
  isBookmarked: boolean;
};

export type MessageFeedPage = {
  rows: MessageFeedRow[];
  hasMore: boolean;
};

type MessageFeedQueryRow = {
  id: string;
  text: string;
  category_tag: string;
  author_username: string;
  created_at: Date | string;
  is_bookmarked: boolean;
};

@Injectable()
export class MessageFeedReadRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleClient | null) {}

  private requireDb(): DrizzleClient {
    if (!this.db) {
      throw new InternalServerErrorException('Database is not configured');
    }
    return this.db;
  }

  async findPage(input: {
    limit: number;
    cursor?: { createdAt: Date; id: string };
    categoryTag?: string;
    authorUsername?: string;
    createdFrom?: Date;
    createdTo?: Date;
    viewerId?: string;
    bookmarkedOnly?: boolean;
  }): Promise<MessageFeedPage> {
    const db = this.requireDb();
    const fetchLimit = input.limit + 1;
    const conditions: SQL[] = [];

    if (input.categoryTag !== undefined) {
      conditions.push(sql`category_tag = ${input.categoryTag}`);
    }

    if (input.authorUsername !== undefined) {
      conditions.push(
        sql`LOWER(author_username) = LOWER(${input.authorUsername})`,
      );
    }

    if (input.createdFrom !== undefined) {
      conditions.push(sql`created_at >= ${input.createdFrom}::timestamptz`);
    }

    if (input.createdTo !== undefined) {
      conditions.push(sql`created_at <= ${input.createdTo}::timestamptz`);
    }

    if (input.cursor) {
      conditions.push(
        sql`(created_at, id) < (${input.cursor.createdAt}::timestamptz, ${input.cursor.id}::uuid)`,
      );
    }

    if (input.bookmarkedOnly === true && input.viewerId !== undefined) {
      conditions.push(sql`EXISTS (
        SELECT 1
        FROM message_bookmarks mb_filter
        WHERE mb_filter.message_id = message_feed.id
          AND mb_filter.user_id = ${input.viewerId}::uuid
      )`);
    }

    const whereClause =
      conditions.length > 0
        ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
        : sql``;

    try {
      const result = await db.execute(sql`
        SELECT
          id,
          text,
          category_tag,
          author_username,
          created_at,
          ${
            input.viewerId
              ? sql`EXISTS (
                  SELECT 1
                  FROM message_bookmarks mb
                  WHERE mb.message_id = message_feed.id
                    AND mb.user_id = ${input.viewerId}::uuid
                )`
              : sql`false`
          } AS is_bookmarked
        FROM message_feed
        ${whereClause}
        ORDER BY created_at DESC, id DESC
        LIMIT ${fetchLimit}
      `);

      const rawRows = result.rows as MessageFeedQueryRow[];
      const rows = rawRows.map((row) => this.mapRow(row));
      const hasMore = rows.length > input.limit;

      return {
        rows: hasMore ? rows.slice(0, input.limit) : rows,
        hasMore,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to list messages', {
        cause: error,
      });
    }
  }

  async refresh(): Promise<void> {
    const db = this.requireDb();

    try {
      await db.execute(
        sql`REFRESH MATERIALIZED VIEW CONCURRENTLY message_feed`,
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to refresh message feed', {
        cause: error,
      });
    }
  }

  private mapRow(row: MessageFeedQueryRow): MessageFeedRow {
    return {
      id: row.id,
      text: row.text,
      categoryTag: row.category_tag,
      authorUsername: row.author_username,
      createdAt:
        row.created_at instanceof Date
          ? row.created_at
          : new Date(row.created_at),
      isBookmarked: row.is_bookmarked,
    };
  }
}
