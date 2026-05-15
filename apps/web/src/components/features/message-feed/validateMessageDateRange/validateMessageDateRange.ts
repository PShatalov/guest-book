export type MessageDateRangeFieldErrors = {
  end?: string;
  general?: string;
  start?: string;
};

export const validateMessageDateRange = (
  start: Date | null,
  end: Date | null,
): MessageDateRangeFieldErrors | null => {
  const hasStart = start !== null;
  const hasEnd = end !== null;

  if (!hasStart && !hasEnd) {
    return {
      general: 'Select at least one date or time bound.',
    };
  }

  if (hasStart && hasEnd && end.getTime() < start.getTime()) {
    return {
      end: 'End must be on or after start.',
    };
  }

  return null;
};
