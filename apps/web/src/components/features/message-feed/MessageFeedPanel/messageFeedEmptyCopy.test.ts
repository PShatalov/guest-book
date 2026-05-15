import { getMessageFeedEmptyCopy } from './messageFeedEmptyCopy';

describe('getMessageFeedEmptyCopy', () => {
  it('returns unfiltered copy when no filters are active', () => {
    expect(getMessageFeedEmptyCopy(null, null, null)).toBe('No messages yet');
  });

  it('returns tag-only copy when only a tag filter is active', () => {
    expect(getMessageFeedEmptyCopy('news', null, null)).toBe(
      'No messages match this tag',
    );
  });

  it('returns date-only copy when only a date filter is active', () => {
    expect(
      getMessageFeedEmptyCopy(
        null,
        {
          createdFrom: '2026-05-01T00:00:00.000Z',
        },
        null,
      ),
    ).toBe('No messages in this date range');
  });

  it('returns username-only copy when only a username filter is active', () => {
    expect(getMessageFeedEmptyCopy(null, null, 'alice')).toBe(
      'No messages from this user',
    );
  });

  it('returns combined copy when tag and date filters are active', () => {
    expect(
      getMessageFeedEmptyCopy(
        'news',
        {
          createdTo: '2026-05-31T23:59:59.999Z',
        },
        null,
      ),
    ).toBe('No messages match these filters');
  });

  it('returns combined copy when username and tag filters are active', () => {
    expect(getMessageFeedEmptyCopy('news', null, 'alice')).toBe(
      'No messages match these filters',
    );
  });
});
