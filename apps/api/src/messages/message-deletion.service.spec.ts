import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MessageDeletionService } from './message-deletion.service';
import { MessageFeedRefreshService } from './message-feed-refresh.service';
import { MessagesRepository } from './messages.repository';

describe('MessageDeletionService', () => {
  let service: MessageDeletionService;
  let repository: {
    findById: jest.Mock;
    deleteById: jest.Mock;
  };
  let feedRefresh: { refresh: jest.Mock };

  const createdAt = new Date('2026-05-15T12:00:00.000Z');

  beforeEach(async () => {
    repository = {
      findById: jest.fn().mockResolvedValue({
        id: 'message-id',
        authorId: 'user-id',
        text: 'Hello',
        categoryTag: 'general',
        createdAt,
      }),
      deleteById: jest.fn().mockResolvedValue(undefined),
    };
    feedRefresh = {
      refresh: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageDeletionService,
        { provide: MessagesRepository, useValue: repository },
        { provide: MessageFeedRefreshService, useValue: feedRefresh },
      ],
    }).compile();

    service = module.get(MessageDeletionService);
  });

  it('deletes the message and refreshes the feed', async () => {
    await expect(
      service.delete({ id: 'user-id', username: 'alice' }, 'message-id'),
    ).resolves.toBeUndefined();

    expect(repository.deleteById).toHaveBeenCalledWith('message-id');
    expect(feedRefresh.refresh).toHaveBeenCalled();
  });

  it('returns not found when the message does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      service.delete({ id: 'user-id', username: 'alice' }, 'missing-id'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repository.deleteById).not.toHaveBeenCalled();
  });

  it('returns forbidden when the caller is not the author', async () => {
    repository.findById.mockResolvedValue({
      id: 'message-id',
      authorId: 'other-user',
      text: 'Hello',
      categoryTag: 'general',
      createdAt,
    });

    await expect(
      service.delete({ id: 'user-id', username: 'alice' }, 'message-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(repository.deleteById).not.toHaveBeenCalled();
  });
});
