export type Message = {
  id: string;
  text: string;
  categoryTag: string;
  authorUsername: string;
  createdAt: string;
};

export const isMessage = (value: unknown): value is Message => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.text === 'string' &&
    typeof record.categoryTag === 'string' &&
    typeof record.authorUsername === 'string' &&
    typeof record.createdAt === 'string'
  );
};

export type PaginatedMessages = {
  items: Message[];
  hasMore: boolean;
  nextCursor: string | null;
};

export const isPaginatedMessages = (
  value: unknown,
): value is PaginatedMessages => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.items) || typeof record.hasMore !== 'boolean') {
    return false;
  }
  if (record.nextCursor !== null && typeof record.nextCursor !== 'string') {
    return false;
  }
  return record.items.every((item) => isMessage(item));
};

export const MAX_MESSAGE_TEXT_LENGTH = 240;
export const MAX_CATEGORY_TAG_LENGTH = 32;
