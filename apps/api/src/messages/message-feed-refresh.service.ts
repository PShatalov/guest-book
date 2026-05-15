import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MessageFeedReadRepository } from './message-feed-read.repository';

@Injectable()
export class MessageFeedRefreshService {
  private readonly logger = new Logger(MessageFeedRefreshService.name);

  constructor(
    private readonly messageFeedReadRepository: MessageFeedReadRepository,
  ) {}

  async refresh(): Promise<void> {
    try {
      await this.messageFeedReadRepository.refresh();
    } catch (error) {
      this.logger.error(
        'Failed to refresh message feed read model',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to refresh message feed', {
        cause: error,
      });
    }
  }
}
