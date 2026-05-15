import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MessageFeedRefreshService } from './message-feed-refresh.service';
import { MessageUpdateService } from './message-update.service';
import { MessagesRepository } from './messages.repository';

describe('MessageUpdateService', () => {
  let service: MessageUpdateService;
  let repository: {
    findById: jest.Mock;
    update: jest.Mock;
  };
  let feedRefresh: { refresh: jest.Mock };

  const createdAt = new Date('2026-05-15T12:00:00.000Z');

  beforeEach(async () => {
    repository = {
      findById: jest.fn().mockResolvedValue({
        id: 'message-id',
        authorId: 'user-id',
        text: 'Old text',
        categoryTag: 'general',
        createdAt,
      }),
      update: jest.fn().mockResolvedValue({
        id: 'message-id',
        authorId: 'user-id',
        text: 'Updated text',
        categoryTag: 'news',
        createdAt,
      }),
    };
    feedRefresh = {
      refresh: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageUpdateService,
        { provide: MessagesRepository, useValue: repository },
        { provide: MessageFeedRefreshService, useValue: feedRefresh },
      ],
    }).compile();

    service = module.get(MessageUpdateService);
  });

  it('updates a message with a normalized category tag', async () => {
    await expect(
      service.update({ id: 'user-id', username: 'alice' }, 'message-id', {
        text: 'Updated text',
        categoryTag: ' News ',
      }),
    ).resolves.toEqual({
      id: 'message-id',
      text: 'Updated text',
      categoryTag: 'news',
      authorUsername: 'alice',
      createdAt: createdAt.toISOString(),
    });

    expect(repository.update).toHaveBeenCalledWith('message-id', {
      text: 'Updated text',
      categoryTag: 'news',
    });
    expect(feedRefresh.refresh).toHaveBeenCalled();
  });

  it('returns not found when the message does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      service.update({ id: 'user-id', username: 'alice' }, 'missing-id', {
        text: 'Updated',
        categoryTag: 'general',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('returns forbidden when the caller is not the author', async () => {
    repository.findById.mockResolvedValue({
      id: 'message-id',
      authorId: 'other-user',
      text: 'Old text',
      categoryTag: 'general',
      createdAt,
    });

    await expect(
      service.update({ id: 'user-id', username: 'alice' }, 'message-id', {
        text: 'Updated',
        categoryTag: 'general',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('rejects a whitespace-only category tag', async () => {
    await expect(
      service.update({ id: 'user-id', username: 'alice' }, 'message-id', {
        text: 'Updated',
        categoryTag: '   ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.findById).not.toHaveBeenCalled();
  });
});
