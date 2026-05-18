import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageBookmarksRepository } from './message-bookmarks.repository';
import type { MessageDto } from './message-creation.service';
import { MessageFeedRefreshService } from './message-feed-refresh.service';
import { MessagesRepository } from './messages.repository';

const MAX_CATEGORY_TAG_LENGTH = 32;

@Injectable()
export class MessageUpdateService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly messageBookmarksRepository: MessageBookmarksRepository,
    private readonly messageFeedRefreshService: MessageFeedRefreshService,
  ) {}

  async update(
    author: { id: string; username: string },
    messageId: string,
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

    const existing = await this.messagesRepository.findById(messageId);

    if (!existing) {
      throw new NotFoundException('Message not found');
    }

    if (existing.authorId !== author.id) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    const record = await this.messagesRepository.update(messageId, {
      text: input.text,
      categoryTag: normalizedTag,
    });
    const isBookmarked = await this.messageBookmarksRepository.isBookmarked({
      userId: author.id,
      messageId,
    });

    await this.messageFeedRefreshService.refresh();

    return {
      id: record.id,
      text: record.text,
      categoryTag: record.categoryTag,
      authorUsername: author.username,
      createdAt: record.createdAt.toISOString(),
      isBookmarked,
    };
  }
}
