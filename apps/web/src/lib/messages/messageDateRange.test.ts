import {
  areDateRangeFiltersEqual,
  dateRangeFilterKey,
  serializeMessageDateRange,
} from './messageDateRange';

describe('messageDateRange', () => {
  it('serializes bounds to ISO-8601 and omits absent params', () => {
    const start = new Date('2026-05-01T10:00:00.000Z');
    const end = new Date('2026-05-31T18:30:00.000Z');

    expect(serializeMessageDateRange(start, null)).toEqual({
      createdFrom: start.toISOString(),
    });
    expect(serializeMessageDateRange(null, end)).toEqual({
      createdTo: end.toISOString(),
    });
    expect(serializeMessageDateRange(start, end)).toEqual({
      createdFrom: start.toISOString(),
      createdTo: end.toISOString(),
    });
  });

  it('builds stable cache keys for equivalent ranges', () => {
    const range = {
      createdFrom: '2026-05-01T00:00:00.000Z',
      createdTo: '2026-05-02T00:00:00.000Z',
    };
    expect(dateRangeFilterKey(range)).toBe(dateRangeFilterKey({ ...range }));
    expect(areDateRangeFiltersEqual(range, { ...range })).toBe(true);
    expect(areDateRangeFiltersEqual(null, null)).toBe(true);
    expect(areDateRangeFiltersEqual(range, null)).toBe(false);
  });
});
