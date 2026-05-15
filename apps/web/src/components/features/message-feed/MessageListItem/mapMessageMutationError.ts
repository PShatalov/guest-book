import { ApiError } from '@/lib/api/apiError';

export const mapMessageMutationError = (
  error: unknown,
  action: 'delete' | 'update',
): string => {
  if (!(error instanceof ApiError)) {
    console.error(error);
    return 'Something went wrong. Please try again.';
  }

  if (error.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (error.status === 400) {
    return error.messages.join(' ');
  }

  if (error.status === 403) {
    return action === 'delete'
      ? 'You can only delete your own messages.'
      : 'You can only edit your own messages.';
  }

  if (error.status === 404) {
    return 'This message is no longer available.';
  }

  console.error(error);
  return 'Something went wrong. Please try again.';
};
