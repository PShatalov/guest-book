import { render, screen } from '@testing-library/react';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';

import { MessageListItemActions } from './MessageListItemActions';

jest.mock('../MessageBookmarkToggle', () => ({
  MessageBookmarkToggle: ({ isSignedIn }: { isSignedIn: boolean }) =>
    isSignedIn ? (
      <button type="button" aria-label="Bookmark message">
        Bookmark
      </button>
    ) : null,
}));

const renderActions = (
  props: Partial<React.ComponentProps<typeof MessageListItemActions>> = {},
) =>
  render(
    <AppThemeProvider>
      <MessageListItemActions
        canManage={false}
        isBookmarked={false}
        isSignedIn={false}
        messageId="msg-1"
        onDelete={jest.fn()}
        onEdit={jest.fn()}
        {...props}
      />
    </AppThemeProvider>,
  );

describe('MessageListItemActions', () => {
  it('renders no controls for signed-out non-owners', () => {
    renderActions();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders bookmark without author actions for signed-in non-owners', () => {
    renderActions({ isSignedIn: true });

    expect(
      screen.getByRole('button', { name: 'Bookmark message' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
  });
});
