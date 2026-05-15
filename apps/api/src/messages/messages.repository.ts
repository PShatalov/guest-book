import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
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

  async findById(id: string): Promise<MessageRecord | null> {
    const db = this.requireDb();

    const [row] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1);

    return row ?? null;
  }

  async update(
    id: string,
    input: { text: string; categoryTag: string },
  ): Promise<MessageRecord> {
    const db = this.requireDb();

    const [updated] = await db
      .update(messages)
      .set({
        text: input.text,
        categoryTag: input.categoryTag,
      })
      .where(eq(messages.id, id))
      .returning();

    if (!updated) {
      throw new InternalServerErrorException('Failed to update message');
    }

    return updated;
  }

  async deleteById(id: string): Promise<void> {
    const db = this.requireDb();

    await db.delete(messages).where(eq(messages.id, id));
  }
}
