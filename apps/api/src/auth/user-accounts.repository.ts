import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { DrizzleClient } from '../database/drizzle.provider';
import { DRIZZLE } from '../database/drizzle.constants';
import { users, type UserAccountRecord } from '../database/schema';
import { UsernameAlreadyExistsError } from './errors/username-already-exists.error';

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  if ('code' in error && (error as { code: string }).code === '23505') {
    return true;
  }

  if ('cause' in error) {
    return isUniqueViolation((error as { cause: unknown }).cause);
  }

  return false;
}

@Injectable()
export class UserAccountsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleClient | null) {}

  private requireDb(): DrizzleClient {
    if (!this.db) {
      throw new InternalServerErrorException('Database is not configured');
    }
    return this.db;
  }

  async findByUsername(username: string): Promise<UserAccountRecord | null> {
    const db = this.requireDb();
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return rows[0] ?? null;
  }

  async create(input: {
    username: string;
    passwordHash: string;
  }): Promise<UserAccountRecord> {
    const db = this.requireDb();

    try {
      const [created] = await db
        .insert(users)
        .values({
          username: input.username,
          passwordHash: input.passwordHash,
        })
        .returning();

      if (!created) {
        throw new InternalServerErrorException('Failed to create user');
      }

      return created;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new UsernameAlreadyExistsError();
      }
      throw error;
    }
  }
}
