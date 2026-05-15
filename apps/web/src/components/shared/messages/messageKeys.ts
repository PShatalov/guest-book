export const messageKeys = {
  all: ['messages'] as const,
  list: (categoryTag: string | null) =>
    [...messageKeys.all, 'list', categoryTag ?? 'all'] as const,
};
