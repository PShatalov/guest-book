import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';
import { ApiError } from '@/lib/api/apiError';
import { MAX_MESSAGE_TEXT_LENGTH } from '@/lib/messages/messageTypes';

import { CreateMessageForm } from './CreateMessageForm';

const renderCreateMessageForm = () =>
  render(
    <AppThemeProvider>
      <CreateMessageForm />
    </AppThemeProvider>,
  );

const mockMutate = jest.fn();

jest.mock('@/components/shared/messages/useCreateMessageMutation', () => ({
  useCreateMessageMutation: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

describe('CreateMessageForm', () => {
  beforeEach(() => {
    mockMutate.mockReset();
  });

  it('shows validation error when message exceeds 240 characters', () => {
    renderCreateMessageForm();

    const longText = 'a'.repeat(MAX_MESSAGE_TEXT_LENGTH + 1);
    fireEvent.change(screen.getByTestId('message-text-input'), {
      target: { value: longText },
    });
    fireEvent.change(screen.getByTestId('category-tag-input'), {
      target: { value: 'general' },
    });
    fireEvent.click(screen.getByRole('button', { name: /post message/i }));

    expect(
      screen.getByText(/must be 240 characters or fewer/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows validation error when category tag is empty', () => {
    renderCreateMessageForm();

    fireEvent.change(screen.getByTestId('message-text-input'), {
      target: { value: 'Hello' },
    });
    fireEvent.change(screen.getByTestId('category-tag-input'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /post message/i }));

    expect(screen.getByText(/category tag is required/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows API validation errors on 400', async () => {
    mockMutate.mockImplementation((_data, options) => {
      options?.onError?.(new ApiError(400, ['text must be shorter']));
    });

    renderCreateMessageForm();

    fireEvent.change(screen.getByTestId('message-text-input'), {
      target: { value: 'Hello' },
    });
    fireEvent.change(screen.getByTestId('category-tag-input'), {
      target: { value: 'general' },
    });
    fireEvent.click(screen.getByRole('button', { name: /post message/i }));

    await waitFor(() => {
      expect(screen.getByText(/text must be shorter/i)).toBeInTheDocument();
    });
  });
});
