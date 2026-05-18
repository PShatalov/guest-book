import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AuthSessionService } from '../auth/auth-session.service';
import type { ListMessagesQueryDto } from './dto/list-messages-query.dto';
import {
  MessageBookmarkingService,
  type BookmarkMessageDto,
} from './message-bookmarking.service';
import { MessageCreationService } from './message-creation.service';
import type { MessageDto } from './message-creation.service';
import { MessageDeletionService } from './message-deletion.service';
import {
  MessageListingService,
  type PaginatedMessagesDto,
} from './message-listing.service';
import { MessageUpdateService } from './message-update.service';

@Injectable()
export class MessagesApplicationService {
  constructor(
    private readonly authSessionService: AuthSessionService,
    private readonly messageCreationService: MessageCreationService,
    private readonly messageBookmarkingService: MessageBookmarkingService,
    private readonly messageListingService: MessageListingService,
    private readonly messageUpdateService: MessageUpdateService,
    private readonly messageDeletionService: MessageDeletionService,
  ) {}

  async createMessage(
    request: Request,
    input: { text: string; categoryTag: string },
  ): Promise<MessageDto> {
    const author = this.authSessionService.getCurrentUser(request);
    return this.messageCreationService.create(author, input);
  }

  listMessages(
    request: Request,
    query: ListMessagesQueryDto,
  ): Promise<PaginatedMessagesDto> {
    const viewer =
      query.bookmarkedOnly === true
        ? this.authSessionService.getCurrentUser(request)
        : this.authSessionService.getOptionalCurrentUser(request);
    return this.messageListingService.list(query, viewer);
  }

  async updateMessage(
    request: Request,
    messageId: string,
    input: { text: string; categoryTag: string },
  ): Promise<MessageDto> {
    const author = this.authSessionService.getCurrentUser(request);
    return this.messageUpdateService.update(author, messageId, input);
  }

  async deleteMessage(request: Request, messageId: string): Promise<void> {
    const author = this.authSessionService.getCurrentUser(request);
    await this.messageDeletionService.delete(author, messageId);
  }

  async bookmarkMessage(
    request: Request,
    messageId: string,
  ): Promise<BookmarkMessageDto> {
    const user = this.authSessionService.getCurrentUser(request);
    return this.messageBookmarkingService.bookmark(user, messageId);
  }

  async unbookmarkMessage(request: Request, messageId: string): Promise<void> {
    const user = this.authSessionService.getCurrentUser(request);
    await this.messageBookmarkingService.unbookmark(user, messageId);
  }
}
