import { render, screen } from '@testing-library/react';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';

import { MessageListItem } from './MessageListItem';

const sampleMessage = {
  id: 'msg-1',
  text: 'Hello guestbook',
  categoryTag: 'general',
  authorUsername: 'alice',
  createdAt: '2026-05-15T12:00:00.000Z',
};

describe('MessageListItem', () => {
  it('renders message text, tag, author, and posted time', () => {
    render(
      <AppThemeProvider>
        <MessageListItem message={sampleMessage} />
      </AppThemeProvider>,
    );
    expect(screen.getByText('Hello guestbook')).toBeInTheDocument();
    expect(screen.getByText('general')).toBeInTheDocument();
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByTestId('message-list-item')).toBeInTheDocument();
  });
});
