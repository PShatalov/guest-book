import { Test, TestingModule } from '@nestjs/testing';
import { MessageFeedReadRepository } from './message-feed-read.repository';
import { MessageFeedRefreshService } from './message-feed-refresh.service';

describe('MessageFeedRefreshService', () => {
  let service: MessageFeedRefreshService;
  let repository: { refresh: jest.Mock };

  beforeEach(async () => {
    repository = {
      refresh: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageFeedRefreshService,
        { provide: MessageFeedReadRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(MessageFeedRefreshService);
  });

  it('refreshes the message feed read model via the repository', async () => {
    await service.refresh();

    expect(repository.refresh).toHaveBeenCalled();
  });
});
