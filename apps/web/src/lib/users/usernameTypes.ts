export const MAX_USERNAME_LENGTH = 64;

export type UsernameSuggestResponse = {
  items: string[];
};

export const isUsernameSuggestResponse = (
  value: unknown,
): value is UsernameSuggestResponse => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    Array.isArray(record.items) &&
    record.items.every((item) => typeof item === 'string')
  );
};
