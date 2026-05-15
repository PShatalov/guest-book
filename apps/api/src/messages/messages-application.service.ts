import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AuthSessionService } from '../auth/auth-session.service';
import type { ListMessagesQueryDto } from './dto/list-messages-query.dto';
import { MessageCreationService } from './message-creation.service';
import type { MessageDto } from './message-creation.service';
import {
  MessageListingService,
  type PaginatedMessagesDto,
} from './message-listing.service';

@Injectable()
export class MessagesApplicationService {
  constructor(
    private readonly authSessionService: AuthSessionService,
    private readonly messageCreationService: MessageCreationService,
    private readonly messageListingService: MessageListingService,
  ) {}

  async createMessage(
    request: Request,
    input: { text: string; categoryTag: string },
  ): Promise<MessageDto> {
    const author = this.authSessionService.getCurrentUser(request);
    return this.messageCreationService.create(author, input);
  }

  listMessages(query: ListMessagesQueryDto): Promise<PaginatedMessagesDto> {
    return this.messageListingService.list(query);
  }
}
