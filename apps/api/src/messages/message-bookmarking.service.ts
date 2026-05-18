import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageBookmarksRepository } from './message-bookmarks.repository';
import { MessagesRepository } from './messages.repository';

export type BookmarkMessageDto = {
  messageId: string;
  isBookmarked: true;
  createdAt: string;
};

@Injectable()
export class MessageBookmarkingService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly messageBookmarksRepository: MessageBookmarksRepository,
  ) {}

  async bookmark(
    user: { id: string; username: string },
    messageId: string,
  ): Promise<BookmarkMessageDto> {
    await this.assertMessageExists(messageId);
    const bookmark = await this.messageBookmarksRepository.bookmark({
      userId: user.id,
      messageId,
    });

    return {
      messageId: bookmark.messageId,
      isBookmarked: true,
      createdAt: bookmark.createdAt.toISOString(),
    };
  }

  async unbookmark(
    user: { id: string; username: string },
    messageId: string,
  ): Promise<void> {
    await this.assertMessageExists(messageId);
    await this.messageBookmarksRepository.unbookmark({
      userId: user.id,
      messageId,
    });
  }

  private async assertMessageExists(messageId: string): Promise<void> {
    const existing = await this.messagesRepository.findById(messageId);

    if (!existing) {
      throw new NotFoundException('Message not found');
    }
  }
}
