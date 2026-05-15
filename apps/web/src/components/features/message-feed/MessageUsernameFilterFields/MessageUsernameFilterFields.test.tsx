import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';

import { MessageUsernameFilterFields } from './MessageUsernameFilterFields';

jest.mock('@/lib/api/apiFetchClient', () => ({
  apiFetchClient: jest.fn().mockResolvedValue({ items: ['alice'] }),
}));

import type { ComponentProps } from 'react';

const renderFields = (
  props: Partial<ComponentProps<typeof MessageUsernameFilterFields>> = {},
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <MessageUsernameFilterFields
          error={null}
          onBlur={jest.fn()}
          onChange={jest.fn()}
          value=""
          {...props}
        />
      </AppThemeProvider>
    </QueryClientProvider>,
  );
};

describe('MessageUsernameFilterFields', () => {
  it('renders the username autocomplete field', () => {
    renderFields();
    expect(screen.getByLabelText(/filter by user name/i)).toBeInTheDocument();
  });

  it('shows inline error text when validation fails', () => {
    renderFields({ error: 'User name is required to filter.', value: '   ' });
    expect(
      screen.getByText(/user name is required to filter/i),
    ).toBeInTheDocument();
  });

  it('calls onChange when the user types', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    renderFields({ onChange: handleChange });

    await user.type(screen.getByLabelText(/filter by user name/i), 'al');

    expect(handleChange).toHaveBeenCalled();
  });
});
