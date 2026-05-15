import { BadRequestException, Injectable } from '@nestjs/common';
import { MessageFeedRefreshService } from './message-feed-refresh.service';
import { MessagesRepository } from './messages.repository';

export type MessageDto = {
  id: string;
  text: string;
  categoryTag: string;
  authorUsername: string;
  createdAt: string;
};

const MAX_CATEGORY_TAG_LENGTH = 32;

@Injectable()
export class MessageCreationService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly messageFeedRefreshService: MessageFeedRefreshService,
  ) {}

  async create(
    author: { id: string; username: string },
    input: { text: string; categoryTag: string },
  ): Promise<MessageDto> {
    const normalizedTag = input.categoryTag.trim().toLowerCase();

    if (normalizedTag.length === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['categoryTag must not be empty'],
        error: 'Bad Request',
      });
    }

    if (normalizedTag.length > MAX_CATEGORY_TAG_LENGTH) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['categoryTag must not exceed 32 characters'],
        error: 'Bad Request',
      });
    }

    const record = await this.messagesRepository.create({
      authorId: author.id,
      text: input.text,
      categoryTag: normalizedTag,
    });

    await this.messageFeedRefreshService.refresh();

    return {
      id: record.id,
      text: record.text,
      categoryTag: record.categoryTag,
      authorUsername: author.username,
      createdAt: record.createdAt.toISOString(),
    };
  }
}
