import { act, renderHook } from '@testing-library/react';
import dayjs from 'dayjs';

import {
  MESSAGE_FEED_FILTER_SECTION_IDS,
  useMessageFeedFilters,
} from './useMessageFeedFilters';

describe('useMessageFeedFilters', () => {
  it('validates whitespace-only tag drafts on apply', () => {
    const { result } = renderHook(() =>
      useMessageFeedFilters({
        activeAuthorUsername: null,
        activeBookmarkedOnly: false,
        activeDateRange: null,
        activeTag: null,
      }),
    );

    act(() => {
      result.current.handleTagChange('   ');
    });

    let committed: ReturnType<typeof result.current.validateAllDrafts>;
    act(() => {
      committed = result.current.validateAllDrafts();
    });

    expect(committed!).toBeNull();
    expect(result.current.tagError).toMatch(/required to filter/i);
  });

  it('validates whitespace-only username drafts on blur', () => {
    const { result } = renderHook(() =>
      useMessageFeedFilters({
        activeAuthorUsername: null,
        activeBookmarkedOnly: false,
        activeDateRange: null,
        activeTag: null,
      }),
    );

    act(() => {
      result.current.handleUsernameChange('   ');
    });
    act(() => {
      result.current.handleUsernameBlur();
    });

    expect(result.current.usernameError).toMatch(/required to filter/i);
  });

  it('validates whitespace-only username drafts on apply', () => {
    const { result } = renderHook(() =>
      useMessageFeedFilters({
        activeAuthorUsername: null,
        activeBookmarkedOnly: false,
        activeDateRange: null,
        activeTag: null,
      }),
    );

    act(() => {
      result.current.setSelectedSectionId(
        MESSAGE_FEED_FILTER_SECTION_IDS.authorUsername,
      );
      result.current.handleUsernameChange('   ');
    });

    let committed: ReturnType<typeof result.current.validateAllDrafts>;
    act(() => {
      committed = result.current.validateAllDrafts();
    });

    expect(committed!).toBeNull();
    expect(result.current.usernameError).toMatch(/required to filter/i);
  });

  it('commits a normalized tag and open-ended date range', () => {
    const { result } = renderHook(() =>
      useMessageFeedFilters({
        activeAuthorUsername: null,
        activeBookmarkedOnly: false,
        activeDateRange: null,
        activeTag: null,
      }),
    );

    const start = dayjs('2026-05-01T10:00:00');

    act(() => {
      result.current.handleTagChange('  GENERAL  ');
      result.current.handleStartChange(start);
    });

    let committed: ReturnType<typeof result.current.validateAllDrafts>;
    act(() => {
      committed = result.current.validateAllDrafts();
    });

    expect(committed!).toEqual({
      authorUsername: null,
      bookmarkedOnly: false,
      categoryTag: 'general',
      dateRange: { createdFrom: start.toDate().toISOString() },
    });
  });

  it('commits a trimmed username filter', () => {
    const { result } = renderHook(() =>
      useMessageFeedFilters({
        activeAuthorUsername: null,
        activeBookmarkedOnly: false,
        activeDateRange: null,
        activeTag: null,
      }),
    );

    act(() => {
      result.current.handleUsernameChange('  alice  ');
    });

    let committed: ReturnType<typeof result.current.validateAllDrafts>;
    act(() => {
      committed = result.current.validateAllDrafts();
    });

    expect(committed!).toEqual({
      authorUsername: 'alice',
      bookmarkedOnly: false,
      categoryTag: null,
      dateRange: null,
    });
  });

  it('clears filters when drafts are empty', () => {
    const { result } = renderHook(() =>
      useMessageFeedFilters({
        activeAuthorUsername: 'alice',
        activeBookmarkedOnly: true,
        activeDateRange: { createdFrom: '2026-05-01T00:00:00.000Z' },
        activeTag: 'news',
      }),
    );

    act(() => {
      result.current.syncDraftsFromActive();
      result.current.clearDrafts();
    });

    let committed: ReturnType<typeof result.current.validateAllDrafts>;
    act(() => {
      committed = result.current.validateAllDrafts();
    });

    expect(committed!).toEqual({
      authorUsername: null,
      bookmarkedOnly: false,
      categoryTag: null,
      dateRange: null,
    });
  });

  it('rejects an end date before the start date', () => {
    const { result } = renderHook(() =>
      useMessageFeedFilters({
        activeAuthorUsername: null,
        activeBookmarkedOnly: false,
        activeDateRange: null,
        activeTag: null,
      }),
    );

    act(() => {
      result.current.handleStartChange(dayjs('2026-05-10T12:00:00'));
      result.current.handleEndChange(dayjs('2026-05-09T12:00:00'));
    });

    let committed: ReturnType<typeof result.current.validateAllDrafts>;
    act(() => {
      committed = result.current.validateAllDrafts();
    });

    expect(committed!).toBeNull();
    expect(result.current.endError).toMatch(/on or after start/i);
  });

  it('includes username in the active filter count', () => {
    const { result } = renderHook(() =>
      useMessageFeedFilters({
        activeAuthorUsername: 'alice',
        activeBookmarkedOnly: false,
        activeDateRange: null,
        activeTag: null,
      }),
    );

    expect(result.current.activeFilterCount).toBe(1);
  });

  it('commits bookmarked-only filtering when enabled', () => {
    const { result } = renderHook(() =>
      useMessageFeedFilters({
        activeAuthorUsername: null,
        activeBookmarkedOnly: false,
        activeDateRange: null,
        activeTag: null,
      }),
    );

    act(() => {
      result.current.handleBookmarkedOnlyChange(true);
    });

    let committed: ReturnType<typeof result.current.validateAllDrafts>;
    act(() => {
      committed = result.current.validateAllDrafts();
    });

    expect(committed!).toEqual({
      authorUsername: null,
      bookmarkedOnly: true,
      categoryTag: null,
      dateRange: null,
    });
  });

  it('includes bookmarked-only in the active filter count', () => {
    const { result } = renderHook(() =>
      useMessageFeedFilters({
        activeAuthorUsername: null,
        activeBookmarkedOnly: true,
        activeDateRange: null,
        activeTag: null,
      }),
    );

    expect(result.current.activeFilterCount).toBe(1);
  });
});
