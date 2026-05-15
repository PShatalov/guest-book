import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageFeedRefreshService } from './message-feed-refresh.service';
import { MessagesRepository } from './messages.repository';

@Injectable()
export class MessageDeletionService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly messageFeedRefreshService: MessageFeedRefreshService,
  ) {}

  async delete(
    author: { id: string; username: string },
    messageId: string,
  ): Promise<void> {
    const existing = await this.messagesRepository.findById(messageId);

    if (!existing) {
      throw new NotFoundException('Message not found');
    }

    if (existing.authorId !== author.id) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.messagesRepository.deleteById(messageId);
    await this.messageFeedRefreshService.refresh();
  }
}
