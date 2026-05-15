import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthenticatedSessionGuard } from '../common/guards/authenticated-session.guard';
import { MessageCreationService } from './message-creation.service';
import { MessageFeedReadRepository } from './message-feed-read.repository';
import { MessageFeedRefreshService } from './message-feed-refresh.service';
import { MessageListingService } from './message-listing.service';
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
    MessageListingService,
    MessagesApplicationService,
    AuthenticatedSessionGuard,
  ],
})
export class MessagesModule {}
