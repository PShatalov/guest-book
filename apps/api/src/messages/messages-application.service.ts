import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AuthSessionService } from '../auth/auth-session.service';
import { MessageCreationService } from './message-creation.service';
import type { MessageDto } from './message-creation.service';

@Injectable()
export class MessagesApplicationService {
  constructor(
    private readonly authSessionService: AuthSessionService,
    private readonly messageCreationService: MessageCreationService,
  ) {}

  async createMessage(
    request: Request,
    input: { text: string; categoryTag: string },
  ): Promise<MessageDto> {
    const author = this.authSessionService.getCurrentUser(request);
    return this.messageCreationService.create(author, input);
  }
}
