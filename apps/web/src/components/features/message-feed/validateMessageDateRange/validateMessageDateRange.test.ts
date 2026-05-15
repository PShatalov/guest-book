import { validateMessageDateRange } from './validateMessageDateRange';

describe('validateMessageDateRange', () => {
  it('requires at least one bound on apply', () => {
    expect(validateMessageDateRange(null, null)).toEqual({
      general: 'Select at least one date or time bound.',
    });
  });

  it('rejects end before start when both bounds are set', () => {
    const start = new Date('2026-05-10T12:00:00.000Z');
    const end = new Date('2026-05-09T12:00:00.000Z');

    expect(validateMessageDateRange(start, end)).toEqual({
      end: 'End must be on or after start.',
    });
  });

  it('accepts open-ended and valid closed ranges', () => {
    const start = new Date('2026-05-01T00:00:00.000Z');
    const end = new Date('2026-05-31T23:59:59.999Z');

    expect(validateMessageDateRange(start, null)).toBeNull();
    expect(validateMessageDateRange(null, end)).toBeNull();
    expect(validateMessageDateRange(start, end)).toBeNull();
  });
});
