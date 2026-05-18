import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MessageListingService } from './message-listing.service';
import { MessageFeedReadRepository } from './message-feed-read.repository';

describe('MessageListingService', () => {
  let service: MessageListingService;
  let repository: { findPage: jest.Mock };

  const row = (
    overrides: Partial<{
      id: string;
      createdAt: Date;
      categoryTag: string;
      isBookmarked: boolean;
    }> = {},
  ) => ({
    id: overrides.id ?? '11111111-1111-4111-8111-111111111111',
    text: 'Hello',
    categoryTag: overrides.categoryTag ?? 'general',
    authorUsername: 'alice',
    createdAt: overrides.createdAt ?? new Date('2026-05-15T12:00:00.000Z'),
    isBookmarked: overrides.isBookmarked ?? false,
  });

  beforeEach(async () => {
    repository = {
      findPage: jest.fn().mockResolvedValue({ rows: [], hasMore: false }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageListingService,
        { provide: MessageFeedReadRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(MessageListingService);
  });

  it('returns an empty page with no next cursor', async () => {
    await expect(service.list({})).resolves.toEqual({
      items: [],
      hasMore: false,
      nextCursor: null,
    });

    expect(repository.findPage).toHaveBeenCalledWith({
      limit: 20,
      cursor: undefined,
      categoryTag: undefined,
      authorUsername: undefined,
      createdFrom: undefined,
      createdTo: undefined,
      viewerId: undefined,
      bookmarkedOnly: false,
    });
  });

  it('passes the current viewer id and maps bookmarked feed state', async () => {
    repository.findPage.mockResolvedValue({
      rows: [row({ isBookmarked: true })],
      hasMore: false,
    });

    const result = await service.list(
      {},
      { id: 'viewer-id', username: 'viewer' },
    );

    expect(repository.findPage).toHaveBeenCalledWith(
      expect.objectContaining({ viewerId: 'viewer-id', bookmarkedOnly: false }),
    );
    expect(result.items[0]).toMatchObject({ isBookmarked: true });
  });

  it('passes bookmarked-only filtering for the current viewer', async () => {
    await service.list(
      { bookmarkedOnly: true },
      { id: 'viewer-id', username: 'viewer' },
    );

    expect(repository.findPage).toHaveBeenCalledWith(
      expect.objectContaining({
        viewerId: 'viewer-id',
        bookmarkedOnly: true,
      }),
    );
  });

  it('rejects bookmarked-only filtering without a current viewer', async () => {
    await expect(service.list({ bookmarkedOnly: true })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(repository.findPage).not.toHaveBeenCalled();
  });

  it('normalizes the category tag filter before querying', async () => {
    await service.list({ categoryTag: ' General ' });

    expect(repository.findPage).toHaveBeenCalledWith(
      expect.objectContaining({ categoryTag: 'general' }),
    );
  });

  it('rejects a whitespace-only category tag', async () => {
    await expect(service.list({ categoryTag: '   ' })).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(repository.findPage).not.toHaveBeenCalled();
  });

  it('rejects a category tag containing null bytes', async () => {
    await expect(
      service.list({ categoryTag: 'gen\0eral' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.findPage).not.toHaveBeenCalled();
  });

  it('trims the author username filter before querying', async () => {
    await service.list({ authorUsername: ' Alice ' });

    expect(repository.findPage).toHaveBeenCalledWith(
      expect.objectContaining({ authorUsername: 'Alice' }),
    );
  });

  it('rejects a whitespace-only author username filter', async () => {
    await expect(
      service.list({ authorUsername: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.findPage).not.toHaveBeenCalled();
  });

  it('rejects an author username filter longer than 64 characters', async () => {
    await expect(
      service.list({ authorUsername: 'a'.repeat(65) }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.findPage).not.toHaveBeenCalled();
  });

  it('rejects an out-of-range limit', async () => {
    await expect(service.list({ limit: 51 })).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(repository.findPage).not.toHaveBeenCalled();
  });

  it('rejects a malformed cursor', async () => {
    await expect(
      service.list({ cursor: 'not-a-cursor' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.findPage).not.toHaveBeenCalled();
  });

  it('decodes a cursor and returns nextCursor when more rows exist', async () => {
    const first = row({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      createdAt: new Date('2026-05-15T12:00:00.000Z'),
    });
    const second = row({
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      createdAt: new Date('2026-05-15T11:00:00.000Z'),
    });
    const third = row({
      id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      createdAt: new Date('2026-05-15T10:00:00.000Z'),
    });

    repository.findPage.mockResolvedValueOnce({
      rows: [first, second],
      hasMore: true,
    });

    const firstPage = await service.list({ limit: 2 });
    expect(firstPage.hasMore).toBe(true);
    expect(firstPage.nextCursor).toEqual(expect.any(String));

    repository.findPage.mockResolvedValueOnce({
      rows: [third],
      hasMore: false,
    });

    const secondPage = await service.list({
      limit: 2,
      cursor: firstPage.nextCursor ?? undefined,
    });

    expect(secondPage.items).toHaveLength(1);
    expect(repository.findPage).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cursor: {
          createdAt: second.createdAt,
          id: second.id,
        },
      }),
    );
  });

  it('passes parsed createdFrom and createdTo bounds to the repository', async () => {
    await service.list({
      createdFrom: '2026-05-15T00:00:00.000Z',
      createdTo: '2026-05-15T23:59:59.999Z',
    });

    expect(repository.findPage).toHaveBeenCalledWith(
      expect.objectContaining({
        createdFrom: new Date('2026-05-15T00:00:00.000Z'),
        createdTo: new Date('2026-05-15T23:59:59.999Z'),
      }),
    );
  });

  it('rejects when createdFrom is after createdTo', async () => {
    await expect(
      service.list({
        createdFrom: '2026-05-16T12:00:00.000Z',
        createdTo: '2026-05-15T12:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.findPage).not.toHaveBeenCalled();
  });

  it('rejects a whitespace-only createdFrom bound', async () => {
    await expect(service.list({ createdFrom: '   ' })).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(repository.findPage).not.toHaveBeenCalled();
  });

  it('rejects an unparseable createdTo bound', async () => {
    await expect(
      service.list({ createdTo: 'not-a-date' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.findPage).not.toHaveBeenCalled();
  });

  it('sets nextCursor when exactly limit rows exist and hasMore is true', async () => {
    repository.findPage.mockResolvedValue({
      rows: [row(), row()],
      hasMore: true,
    });

    const result = await service.list({ limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toEqual(expect.any(String));
  });
});
