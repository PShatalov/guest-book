import { BadRequestException, Injectable } from '@nestjs/common';
import { UserAccountsRepository } from '../auth/user-accounts.repository';

const DEFAULT_SUGGEST_LIMIT = 10;
const MIN_SUGGEST_LIMIT = 1;
const MAX_SUGGEST_LIMIT = 50;
const MAX_USERNAME_LENGTH = 64;

@Injectable()
export class UsernameSuggestionService {
  constructor(
    private readonly userAccountsRepository: UserAccountsRepository,
  ) {}

  async suggest(input: {
    q: string;
    limit?: number;
  }): Promise<{ items: string[] }> {
    const limit = input.limit ?? DEFAULT_SUGGEST_LIMIT;

    if (
      !Number.isInteger(limit) ||
      limit < MIN_SUGGEST_LIMIT ||
      limit > MAX_SUGGEST_LIMIT
    ) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['limit must be an integer between 1 and 50'],
        error: 'Bad Request',
      });
    }

    const prefix = this.normalizeQueryPrefix(input.q);
    const items = await this.userAccountsRepository.findUsernamesByPrefix(
      prefix,
      limit,
    );

    return { items };
  }

  private normalizeQueryPrefix(q: string): string {
    const normalized = q.trim();

    if (normalized.length === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['q must not be empty'],
        error: 'Bad Request',
      });
    }

    if (normalized.length > MAX_USERNAME_LENGTH) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['q must not exceed 64 characters'],
        error: 'Bad Request',
      });
    }

    return normalized;
  }
}
