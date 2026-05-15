import { render, screen } from '@testing-library/react';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';

import { CreateMessagePanel } from './CreateMessagePanel';

jest.mock('@/components/shared/auth/useAuthSession', () => ({
  useAuthSession: jest.fn(),
}));

jest.mock('../CreateMessageForm', () => ({
  CreateMessageForm: () => <div data-testid="create-message-form" />,
}));

const { useAuthSession } = jest.requireMock<{
  useAuthSession: jest.Mock;
}>('@/components/shared/auth/useAuthSession');

const renderPanel = () =>
  render(
    <AppThemeProvider>
      <CreateMessagePanel />
    </AppThemeProvider>,
  );

describe('CreateMessagePanel', () => {
  it('shows a skeleton while session is loading', () => {
    useAuthSession.mockReturnValue({
      username: null,
      isPending: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    renderPanel();

    expect(screen.getByTestId('create-message-loading')).toBeInTheDocument();
  });

  it('shows sign-in call-to-action when unauthenticated', () => {
    useAuthSession.mockReturnValue({
      username: null,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    renderPanel();

    expect(screen.getByText(/sign in to post a message/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('renders the compose form when authenticated', () => {
    useAuthSession.mockReturnValue({
      username: 'alice',
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    renderPanel();

    expect(screen.getByTestId('create-message-form')).toBeInTheDocument();
  });
});
