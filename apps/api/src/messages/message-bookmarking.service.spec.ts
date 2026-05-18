import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MessageBookmarkingService } from './message-bookmarking.service';
import { MessageBookmarksRepository } from './message-bookmarks.repository';
import { MessagesRepository } from './messages.repository';

describe('MessageBookmarkingService', () => {
  let service: MessageBookmarkingService;
  let messagesRepository: { findById: jest.Mock };
  let bookmarksRepository: {
    bookmark: jest.Mock;
    unbookmark: jest.Mock;
  };
  const bookmarkCreatedAt = new Date('2026-05-16T12:00:00.000Z');

  beforeEach(async () => {
    messagesRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'message-id',
        authorId: 'author-id',
        text: 'Hello',
        categoryTag: 'general',
        createdAt: new Date('2026-05-15T12:00:00.000Z'),
      }),
    };
    bookmarksRepository = {
      bookmark: jest.fn().mockResolvedValue({
        userId: 'user-id',
        messageId: 'message-id',
        createdAt: bookmarkCreatedAt,
      }),
      unbookmark: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageBookmarkingService,
        { provide: MessagesRepository, useValue: messagesRepository },
        { provide: MessageBookmarksRepository, useValue: bookmarksRepository },
      ],
    }).compile();

    service = module.get(MessageBookmarkingService);
  });

  it('bookmarks an existing message for the signed-in user', async () => {
    await expect(
      service.bookmark({ id: 'user-id', username: 'alice' }, 'message-id'),
    ).resolves.toEqual({
      messageId: 'message-id',
      isBookmarked: true,
      createdAt: bookmarkCreatedAt.toISOString(),
    });

    expect(bookmarksRepository.bookmark).toHaveBeenCalledWith({
      userId: 'user-id',
      messageId: 'message-id',
    });
  });

  it('unbookmarks an existing message for the signed-in user', async () => {
    await expect(
      service.unbookmark({ id: 'user-id', username: 'alice' }, 'message-id'),
    ).resolves.toBeUndefined();

    expect(bookmarksRepository.unbookmark).toHaveBeenCalledWith({
      userId: 'user-id',
      messageId: 'message-id',
    });
  });

  it('returns not found when bookmarking a missing message', async () => {
    messagesRepository.findById.mockResolvedValue(null);

    await expect(
      service.bookmark({ id: 'user-id', username: 'alice' }, 'missing-id'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(bookmarksRepository.bookmark).not.toHaveBeenCalled();
  });

  it('returns not found when unbookmarking a missing message', async () => {
    messagesRepository.findById.mockResolvedValue(null);

    await expect(
      service.unbookmark({ id: 'user-id', username: 'alice' }, 'missing-id'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(bookmarksRepository.unbookmark).not.toHaveBeenCalled();
  });
});
