import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../database/drizzle.constants';
import type { DrizzleClient } from '../database/drizzle.provider';
import { messageBookmarks } from '../database/schema';

export type MessageBookmarkStateRecord = {
  userId: string;
  messageId: string;
  createdAt: Date;
};

@Injectable()
export class MessageBookmarksRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleClient | null) {}

  private requireDb(): DrizzleClient {
    if (!this.db) {
      throw new InternalServerErrorException('Database is not configured');
    }

    return this.db;
  }

  async bookmark(input: {
    userId: string;
    messageId: string;
  }): Promise<MessageBookmarkStateRecord> {
    const db = this.requireDb();

    try {
      const [created] = await db
        .insert(messageBookmarks)
        .values({
          userId: input.userId,
          messageId: input.messageId,
        })
        .onConflictDoNothing()
        .returning();

      if (created) {
        return created;
      }

      const [existing] = await db
        .select()
        .from(messageBookmarks)
        .where(
          and(
            eq(messageBookmarks.userId, input.userId),
            eq(messageBookmarks.messageId, input.messageId),
          ),
        )
        .limit(1);

      if (existing) {
        return existing;
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to bookmark message', {
        cause: error,
      });
    }

    throw new InternalServerErrorException('Failed to bookmark message');
  }

  async isBookmarked(input: {
    userId: string;
    messageId: string;
  }): Promise<boolean> {
    const db = this.requireDb();

    try {
      const [existing] = await db
        .select({ messageId: messageBookmarks.messageId })
        .from(messageBookmarks)
        .where(
          and(
            eq(messageBookmarks.userId, input.userId),
            eq(messageBookmarks.messageId, input.messageId),
          ),
        )
        .limit(1);

      return existing !== undefined;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to read message bookmark',
        {
          cause: error,
        },
      );
    }
  }

  async unbookmark(input: {
    userId: string;
    messageId: string;
  }): Promise<void> {
    const db = this.requireDb();

    try {
      await db
        .delete(messageBookmarks)
        .where(
          and(
            eq(messageBookmarks.userId, input.userId),
            eq(messageBookmarks.messageId, input.messageId),
          ),
        );
    } catch (error) {
      throw new InternalServerErrorException('Failed to unbookmark message', {
        cause: error,
      });
    }
  }
}
