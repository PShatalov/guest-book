export type MessageDateRangeFilter = {
  createdFrom?: string;
  createdTo?: string;
};

export const serializeMessageDateRange = (
  start: Date | null,
  end: Date | null,
): MessageDateRangeFilter => {
  const range: MessageDateRangeFilter = {};
  if (start !== null) {
    range.createdFrom = start.toISOString();
  }
  if (end !== null) {
    range.createdTo = end.toISOString();
  }
  return range;
};

export const dateRangeFilterKey = (
  dateRange: MessageDateRangeFilter | null,
): string => {
  if (dateRange === null) {
    return 'no-date';
  }
  const from = dateRange.createdFrom ?? '';
  const to = dateRange.createdTo ?? '';
  return `${from}|${to}`;
};

export const areDateRangeFiltersEqual = (
  left: MessageDateRangeFilter | null,
  right: MessageDateRangeFilter | null,
): boolean => dateRangeFilterKey(left) === dateRangeFilterKey(right);
