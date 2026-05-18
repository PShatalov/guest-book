import { isMessage, isPaginatedMessages } from './messageTypes';

describe('messageTypes', () => {
  it('validates paginated messages', () => {
    expect(
      isPaginatedMessages({
        items: [
          {
            id: '1',
            text: 'Hello',
            categoryTag: 'general',
            authorUsername: 'alice',
            createdAt: '2026-05-15T12:00:00.000Z',
            isBookmarked: false,
          },
        ],
        hasMore: false,
        nextCursor: null,
      }),
    ).toBe(true);
  });

  it('rejects invalid items in paginated messages', () => {
    expect(
      isPaginatedMessages({
        items: [{ id: '1' }],
        hasMore: false,
        nextCursor: null,
      }),
    ).toBe(false);
  });

  it('validates a single message', () => {
    expect(
      isMessage({
        id: '1',
        text: 'Hello',
        categoryTag: 'general',
        authorUsername: 'alice',
        createdAt: '2026-05-15T12:00:00.000Z',
        isBookmarked: true,
      }),
    ).toBe(true);
  });

  it('rejects a message without bookmark state', () => {
    expect(
      isMessage({
        id: '1',
        text: 'Hello',
        categoryTag: 'general',
        authorUsername: 'alice',
        createdAt: '2026-05-15T12:00:00.000Z',
      }),
    ).toBe(false);
  });
});
