import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthenticatedSessionGuard } from '../common/guards/authenticated-session.guard';
import { MessageCreationService } from './message-creation.service';
import { MessageDeletionService } from './message-deletion.service';
import { MessageFeedReadRepository } from './message-feed-read.repository';
import { MessageFeedRefreshService } from './message-feed-refresh.service';
import { MessageListingService } from './message-listing.service';
import { MessageUpdateService } from './message-update.service';
import { MessagesApplicationService } from './messages-application.service';
import { MessagesController } from './messages.controller';
import { MessagesRepository } from './messages.repository';

@Module({
  imports: [AuthModule],
  controllers: [MessagesController],
  providers: [
    MessagesRepository,
    MessageFeedReadRepository,
    MessageFeedRefreshService,
    MessageCreationService,
    MessageUpdateService,
    MessageDeletionService,
    MessageListingService,
    MessagesApplicationService,
    AuthenticatedSessionGuard,
  ],
})
export class MessagesModule {}
