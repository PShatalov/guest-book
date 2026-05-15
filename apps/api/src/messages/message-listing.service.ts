import { BadRequestException, Injectable } from '@nestjs/common';
import type { MessageDto } from './message-creation.service';
import {
  MessageFeedReadRepository,
  type MessageFeedRow,
} from './message-feed-read.repository';

const DEFAULT_LIMIT = 20;
const MIN_LIMIT = 1;
const MAX_LIMIT = 50;
const MAX_CATEGORY_TAG_LENGTH = 32;
const MAX_AUTHOR_USERNAME_LENGTH = 64;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PaginatedMessagesDto = {
  items: MessageDto[];
  hasMore: boolean;
  nextCursor: string | null;
};

type DecodedCursor = {
  createdAt: Date;
  id: string;
};

type ListMessagesInput = {
  limit?: number;
  cursor?: string;
  categoryTag?: string;
  authorUsername?: string;
  createdFrom?: string;
  createdTo?: string;
};

@Injectable()
export class MessageListingService {
  constructor(
    private readonly messageFeedReadRepository: MessageFeedReadRepository,
  ) {}

  async list(input: ListMessagesInput): Promise<PaginatedMessagesDto> {
    const limit = input.limit ?? DEFAULT_LIMIT;

    if (!Number.isInteger(limit) || limit < MIN_LIMIT || limit > MAX_LIMIT) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['limit must be an integer between 1 and 50'],
        error: 'Bad Request',
      });
    }

    const categoryTag = this.normalizeCategoryTagFilter(input.categoryTag);
    const authorUsername = this.normalizeAuthorUsernameFilter(
      input.authorUsername,
    );
    const cursor = this.decodeCursor(input.cursor);
    const createdFrom = this.parseCreatedBound(
      input.createdFrom,
      'createdFrom',
    );
    const createdTo = this.parseCreatedBound(input.createdTo, 'createdTo');

    if (
      createdFrom !== undefined &&
      createdTo !== undefined &&
      createdFrom.getTime() > createdTo.getTime()
    ) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['createdFrom must not be after createdTo'],
        error: 'Bad Request',
      });
    }

    const page = await this.messageFeedReadRepository.findPage({
      limit,
      cursor,
      categoryTag,
      authorUsername,
      createdFrom,
      createdTo,
    });

    const items = page.rows.map((row) => this.toMessageDto(row));
    const nextCursor =
      page.hasMore && page.rows.length > 0
        ? this.encodeCursor(page.rows[page.rows.length - 1])
        : null;

    return {
      items,
      hasMore: page.hasMore,
      nextCursor,
    };
  }

  private parseCreatedBound(
    value: string | undefined,
    field: 'createdFrom' | 'createdTo',
  ): Date | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value.trim().length === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: [`${field} must be a valid ISO-8601 date-time`],
        error: 'Bad Request',
      });
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException({
        statusCode: 400,
        message: [`${field} must be a valid ISO-8601 date-time`],
        error: 'Bad Request',
      });
    }

    return parsed;
  }

  private normalizeCategoryTagFilter(
    categoryTag: string | undefined,
  ): string | undefined {
    if (categoryTag === undefined) {
      return undefined;
    }

    const normalized = categoryTag.trim().toLowerCase();

    if (normalized.length === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['categoryTag must not be empty'],
        error: 'Bad Request',
      });
    }

    if (normalized.length > MAX_CATEGORY_TAG_LENGTH) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['categoryTag must not exceed 32 characters'],
        error: 'Bad Request',
      });
    }

    return normalized;
  }

  private normalizeAuthorUsernameFilter(
    authorUsername: string | undefined,
  ): string | undefined {
    if (authorUsername === undefined) {
      return undefined;
    }

    const normalized = authorUsername.trim();

    if (normalized.length === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['authorUsername must not be empty'],
        error: 'Bad Request',
      });
    }

    if (normalized.length > MAX_AUTHOR_USERNAME_LENGTH) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['authorUsername must not exceed 64 characters'],
        error: 'Bad Request',
      });
    }

    return normalized;
  }

  private decodeCursor(cursor: string | undefined): DecodedCursor | undefined {
    if (cursor === undefined) {
      return undefined;
    }

    if (cursor.trim().length === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['cursor is invalid'],
        error: 'Bad Request',
      });
    }

    try {
      const payload = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as { createdAt?: unknown; id?: unknown };

      if (
        typeof payload.createdAt !== 'string' ||
        typeof payload.id !== 'string'
      ) {
        throw new Error('Invalid cursor payload');
      }

      const createdAt = new Date(payload.createdAt);
      if (Number.isNaN(createdAt.getTime())) {
        throw new Error('Invalid cursor timestamp');
      }

      if (!UUID_PATTERN.test(payload.id)) {
        throw new Error('Invalid cursor id');
      }

      return { createdAt, id: payload.id };
    } catch {
      throw new BadRequestException({
        statusCode: 400,
        message: ['cursor is invalid'],
        error: 'Bad Request',
      });
    }
  }

  private encodeCursor(row: MessageFeedRow): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: row.createdAt.toISOString(),
        id: row.id,
      }),
    ).toString('base64url');
  }

  private toMessageDto(row: MessageFeedRow): MessageDto {
    return {
      id: row.id,
      text: row.text,
      categoryTag: row.categoryTag,
      authorUsername: row.authorUsername,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
