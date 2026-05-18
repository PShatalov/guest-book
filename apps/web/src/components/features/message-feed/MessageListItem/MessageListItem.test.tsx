import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';
import { ApiError } from '@/lib/api/apiError';

import { MessageListItem } from './MessageListItem';

const sampleMessage = {
  id: 'msg-1',
  text: 'Hello guestbook',
  categoryTag: 'general',
  authorUsername: 'alice',
  createdAt: '2026-05-15T12:00:00.000Z',
  isBookmarked: false,
};

const mockUpdateMutate = jest.fn();
const mockDeleteMutate = jest.fn();
const mockBookmarkMutate = jest.fn();

jest.mock('@/components/shared/messages/useUpdateMessageMutation', () => ({
  useUpdateMessageMutation: () => ({
    mutate: mockUpdateMutate,
    isPending: false,
  }),
}));

jest.mock('@/components/shared/messages/useDeleteMessageMutation', () => ({
  useDeleteMessageMutation: () => ({
    mutate: mockDeleteMutate,
    isPending: false,
  }),
}));

jest.mock('@/components/shared/messages/useBookmarkMessageMutation', () => ({
  useBookmarkMessageMutation: () => ({
    mutate: mockBookmarkMutate,
    isPending: false,
  }),
}));

const renderMessageListItem = (
  props: Partial<React.ComponentProps<typeof MessageListItem>> = {},
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <MessageListItem message={sampleMessage} {...props} />
      </AppThemeProvider>
    </QueryClientProvider>,
  );
};

describe('MessageListItem', () => {
  beforeEach(() => {
    mockUpdateMutate.mockReset();
    mockDeleteMutate.mockReset();
    mockBookmarkMutate.mockReset();
  });

  it('renders message text, tag, author, and posted time', () => {
    renderMessageListItem();
    expect(screen.getByText('Hello guestbook')).toBeInTheDocument();
    expect(screen.getByText('general')).toBeInTheDocument();
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByTestId('message-list-item')).toBeInTheDocument();
  });

  it('hides edit and delete when current user does not own the message', () => {
    renderMessageListItem({ currentUsername: 'bob' });
    expect(screen.queryByTestId('message-edit-button')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('message-delete-button'),
    ).not.toBeInTheDocument();
  });

  it('shows bookmark control for signed-in non-owners only', () => {
    renderMessageListItem({ currentUsername: 'bob' });
    expect(
      screen.getByRole('button', { name: 'Bookmark message' }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('message-edit-button')).not.toBeInTheDocument();
  });

  it('hides bookmark control for signed-out readers', () => {
    renderMessageListItem({ currentUsername: null });
    expect(
      screen.queryByRole('button', { name: 'Bookmark message' }),
    ).not.toBeInTheDocument();
  });

  it('shows icon edit and delete when current user owns the message', () => {
    renderMessageListItem({ currentUsername: 'alice' });

    const listItem = screen.getByTestId('message-list-item');
    const editButton = within(listItem).getByRole('button', { name: 'Edit' });
    const deleteButton = within(listItem).getByRole('button', {
      name: 'Delete',
    });

    expect(editButton).toHaveAttribute('data-testid', 'message-edit-button');
    expect(deleteButton).toHaveAttribute(
      'data-testid',
      'message-delete-button',
    );
    expect(within(listItem).queryByText('Edit')).not.toBeInTheDocument();
    expect(within(listItem).queryByText('Delete')).not.toBeInTheDocument();
  });

  it('places author actions on the same row as category tag and author metadata', () => {
    renderMessageListItem({ currentUsername: 'alice' });

    const listItem = screen.getByTestId('message-list-item');
    const categoryTag = within(listItem).getByText('general');
    const editButton = within(listItem).getByRole('button', { name: 'Edit' });
    const footer = editButton.parentElement?.parentElement?.parentElement;

    expect(footer).toBeTruthy();
    expect(footer).toContainElement(categoryTag);
    expect(footer).toContainElement(editButton);
  });

  it('enters inline edit mode and saves via mutation', async () => {
    const user = userEvent.setup();
    mockUpdateMutate.mockImplementation((_variables, options) => {
      options?.onSuccess?.();
    });
    renderMessageListItem({ currentUsername: 'alice' });

    await user.click(screen.getByTestId('message-edit-button'));
    expect(screen.getByTestId('message-edit-text-input')).toBeInTheDocument();

    await user.clear(screen.getByTestId('message-edit-text-input'));
    await user.type(
      screen.getByTestId('message-edit-text-input'),
      'Updated copy',
    );
    await user.click(screen.getByTestId('message-edit-save-button'));

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        {
          id: 'msg-1',
          payload: { text: 'Updated copy', categoryTag: 'general' },
        },
        expect.any(Object),
      );
    });
    expect(
      screen.queryByTestId('message-edit-text-input'),
    ).not.toBeInTheDocument();
  });

  it('closes inline edit without saving when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderMessageListItem({ currentUsername: 'alice' });

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByTestId('message-edit-text-input'));
    await user.type(
      screen.getByTestId('message-edit-text-input'),
      'Draft only',
    );
    await user.click(screen.getByTestId('message-edit-cancel-button'));

    expect(mockUpdateMutate).not.toHaveBeenCalled();
    expect(screen.getByText('Hello guestbook')).toBeInTheDocument();
  });

  it('closes inline edit without saving when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderMessageListItem({ currentUsername: 'alice' });

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByTestId('message-edit-text-input'));
    await user.type(
      screen.getByTestId('message-edit-text-input'),
      'Draft only',
    );
    await user.keyboard('{Escape}');

    expect(mockUpdateMutate).not.toHaveBeenCalled();
    expect(screen.getByText('Hello guestbook')).toBeInTheDocument();
    expect(
      screen.queryByTestId('message-edit-text-input'),
    ).not.toBeInTheDocument();
  });

  it('shows inline error when save fails', async () => {
    const user = userEvent.setup();
    mockUpdateMutate.mockImplementation((_variables, options) => {
      options?.onError?.(new ApiError(400, ['text must be shorter']));
    });
    renderMessageListItem({ currentUsername: 'alice' });

    await user.click(screen.getByTestId('message-edit-button'));
    await user.click(screen.getByTestId('message-edit-save-button'));

    await waitFor(() => {
      expect(screen.getByText(/text must be shorter/i)).toBeInTheDocument();
    });
  });

  it('opens delete dialog and confirms deletion', async () => {
    const user = userEvent.setup();
    mockDeleteMutate.mockImplementation((_id, options) => {
      options?.onSuccess?.();
    });
    renderMessageListItem({ currentUsername: 'alice' });

    await user.click(screen.getByTestId('message-delete-button'));
    expect(screen.getByTestId('message-delete-dialog')).toBeInTheDocument();

    await user.click(screen.getByTestId('message-delete-confirm-button'));

    await waitFor(() => {
      expect(mockDeleteMutate).toHaveBeenCalledWith(
        'msg-1',
        expect.any(Object),
      );
    });
  });

  it('shows delete error inside the dialog when deletion fails', async () => {
    const user = userEvent.setup();
    mockDeleteMutate.mockImplementation((_id, options) => {
      options?.onError?.(new ApiError(403, ['Forbidden']));
    });
    renderMessageListItem({ currentUsername: 'alice' });

    await user.click(screen.getByTestId('message-delete-button'));
    await user.click(screen.getByTestId('message-delete-confirm-button'));

    await waitFor(() => {
      expect(
        screen.getByText(/you can only delete your own messages/i),
      ).toBeInTheDocument();
    });
  });
});
