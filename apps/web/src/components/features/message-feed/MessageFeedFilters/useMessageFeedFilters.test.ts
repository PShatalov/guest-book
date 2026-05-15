import { act, renderHook } from '@testing-library/react';
import dayjs from 'dayjs';

import { useMessageFeedFilters } from './useMessageFeedFilters';

describe('useMessageFeedFilters', () => {
  it('validates whitespace-only tag drafts on apply', () => {
    const { result } = renderHook(() =>
      useMessageFeedFilters({ activeDateRange: null, activeTag: null }),
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

  it('commits a normalized tag and open-ended date range', () => {
    const { result } = renderHook(() =>
      useMessageFeedFilters({ activeDateRange: null, activeTag: null }),
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
      categoryTag: 'general',
      dateRange: { createdFrom: start.toDate().toISOString() },
    });
  });

  it('clears filters when drafts are empty', () => {
    const { result } = renderHook(() =>
      useMessageFeedFilters({
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
      categoryTag: null,
      dateRange: null,
    });
  });

  it('rejects an end date before the start date', () => {
    const { result } = renderHook(() =>
      useMessageFeedFilters({ activeDateRange: null, activeTag: null }),
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
});
