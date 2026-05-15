import { render, screen, within } from '@testing-library/react';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';

import { MessageListItemReadContent } from './MessageListItemReadContent';

const sampleMessage = {
  id: 'msg-1',
  text: 'Hello guestbook',
  categoryTag: 'general',
  authorUsername: 'alice',
  createdAt: '2026-05-15T12:00:00.000Z',
};

const renderReadContent = (
  props: Partial<React.ComponentProps<typeof MessageListItemReadContent>> = {},
) =>
  render(
    <AppThemeProvider>
      <MessageListItemReadContent
        message={sampleMessage}
        postedAtLabel="5/15/2026, 7:43:21 PM"
        {...props}
      />
    </AppThemeProvider>,
  );

describe('MessageListItemReadContent', () => {
  it('renders message text and metadata without actions', () => {
    renderReadContent();

    expect(screen.getByText('Hello guestbook')).toBeInTheDocument();
    expect(screen.getByText('general')).toBeInTheDocument();
    expect(screen.getByText(/alice · 5\/15\/2026/i)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders actions in the footer row alongside metadata', () => {
    renderReadContent({
      actions: (
        <button data-testid="fixture-actions" type="button">
          Actions
        </button>
      ),
    });

    const categoryTag = screen.getByText('general');
    const actions = screen.getByTestId('fixture-actions');
    const footer = actions.parentElement;

    expect(footer).toBeTruthy();
    expect(footer).toContainElement(categoryTag);
    expect(footer).toContainElement(actions);
    expect(
      within(footer as HTMLElement).getByText(/alice/i),
    ).toBeInTheDocument();
  });
});
