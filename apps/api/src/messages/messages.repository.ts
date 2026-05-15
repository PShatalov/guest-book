import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { DrizzleClient } from '../database/drizzle.provider';
import { DRIZZLE } from '../database/drizzle.constants';
import { messages, type MessageRecord } from '../database/schema';

@Injectable()
export class MessagesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleClient | null) {}

  private requireDb(): DrizzleClient {
    if (!this.db) {
      throw new InternalServerErrorException('Database is not configured');
    }
    return this.db;
  }

  async create(input: {
    authorId: string;
    text: string;
    categoryTag: string;
  }): Promise<MessageRecord> {
    const db = this.requireDb();

    const [created] = await db
      .insert(messages)
      .values({
        authorId: input.authorId,
        text: input.text,
        categoryTag: input.categoryTag,
      })
      .returning();

    if (!created) {
      throw new InternalServerErrorException('Failed to create message');
    }

    return created;
  }
}
