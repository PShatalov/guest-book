import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MessageCreationService } from './message-creation.service';
import { MessageFeedRefreshService } from './message-feed-refresh.service';
import { MessagesRepository } from './messages.repository';

describe('MessageCreationService', () => {
  let service: MessageCreationService;
  let repository: { create: jest.Mock };
  let feedRefresh: { refresh: jest.Mock };

  const createdAt = new Date('2026-05-15T12:00:00.000Z');

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockResolvedValue({
        id: 'message-id',
        authorId: 'user-id',
        text: 'Hello guestbook',
        categoryTag: 'general',
        createdAt,
      }),
    };
    feedRefresh = {
      refresh: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageCreationService,
        { provide: MessagesRepository, useValue: repository },
        { provide: MessageFeedRefreshService, useValue: feedRefresh },
      ],
    }).compile();

    service = module.get(MessageCreationService);
  });

  it('persists a message with a normalized lowercase category tag', async () => {
    await expect(
      service.create(
        { id: 'user-id', username: 'alice' },
        { text: 'Hello guestbook', categoryTag: ' General ' },
      ),
    ).resolves.toEqual({
      id: 'message-id',
      text: 'Hello guestbook',
      categoryTag: 'general',
      authorUsername: 'alice',
      createdAt: createdAt.toISOString(),
    });

    expect(repository.create).toHaveBeenCalledWith({
      authorId: 'user-id',
      text: 'Hello guestbook',
      categoryTag: 'general',
    });
    expect(feedRefresh.refresh).toHaveBeenCalled();
  });

  it('rejects a whitespace-only category tag', async () => {
    await expect(
      service.create(
        { id: 'user-id', username: 'alice' },
        { text: 'Hello', categoryTag: '   ' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.create).not.toHaveBeenCalled();
  });
});
