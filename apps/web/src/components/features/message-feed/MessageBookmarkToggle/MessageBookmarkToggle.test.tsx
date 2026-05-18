import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';

import { MessageBookmarkToggle } from './MessageBookmarkToggle';

const mockBookmarkMutate = jest.fn();

jest.mock('@/components/shared/messages/useBookmarkMessageMutation', () => ({
  useBookmarkMessageMutation: () => ({
    mutate: mockBookmarkMutate,
    isPending: false,
  }),
}));

const renderBookmarkToggle = (
  props: Partial<React.ComponentProps<typeof MessageBookmarkToggle>> = {},
) =>
  render(
    <AppThemeProvider>
      <MessageBookmarkToggle
        isBookmarked={false}
        isSignedIn={true}
        messageId="msg-1"
        {...props}
      />
    </AppThemeProvider>,
  );

describe('MessageBookmarkToggle', () => {
  beforeEach(() => {
    mockBookmarkMutate.mockReset();
  });

  it('renders nothing for signed-out readers', () => {
    renderBookmarkToggle({ isSignedIn: false });

    expect(
      screen.queryByRole('button', { name: /bookmark/i }),
    ).not.toBeInTheDocument();
  });

  it('bookmarks an unbookmarked message when clicked', async () => {
    const user = userEvent.setup();
    renderBookmarkToggle();

    await user.click(screen.getByRole('button', { name: 'Bookmark message' }));

    expect(mockBookmarkMutate).toHaveBeenCalledWith(
      { id: 'msg-1', shouldBookmark: true },
      expect.any(Object),
    );
  });

  it('unbookmarks a bookmarked message when clicked', async () => {
    const user = userEvent.setup();
    renderBookmarkToggle({ isBookmarked: true });

    await user.click(screen.getByRole('button', { name: 'Remove bookmark' }));

    expect(mockBookmarkMutate).toHaveBeenCalledWith(
      { id: 'msg-1', shouldBookmark: false },
      expect.any(Object),
    );
  });
});
