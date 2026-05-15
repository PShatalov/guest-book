import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';
import { ApiError } from '@/lib/api/apiError';

import { SignUpForm } from './SignUpForm';

const renderSignUpForm = (props?: React.ComponentProps<typeof SignUpForm>) =>
  render(
    <AppThemeProvider>
      <SignUpForm {...props} />
    </AppThemeProvider>,
  );

const mockMutate = jest.fn();

jest.mock('@/components/shared/auth/useAuthMutations', () => ({
  useAuthMutations: () => ({
    register: {
      mutate: mockMutate,
      isPending: false,
    },
    login: { mutate: jest.fn(), isPending: false },
    logout: { mutate: jest.fn(), isPending: false },
  }),
}));

describe('SignUpForm', () => {
  beforeEach(() => {
    mockMutate.mockReset();
  });

  it('shows password policy errors before calling the API', async () => {
    renderSignUpForm();

    fireEvent.change(screen.getByTestId('username-input'), {
      target: { value: 'alice' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'weak' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(mockMutate).not.toHaveBeenCalled();
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it('shows username taken error on 409', async () => {
    mockMutate.mockImplementation((_data, options) => {
      options?.onError?.(new ApiError(409, 'Username already exists'));
    });

    renderSignUpForm();

    fireEvent.change(screen.getByTestId('username-input'), {
      target: { value: 'alice' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'Str0ng!pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/username is already in use/i),
      ).toBeInTheDocument();
    });
  });

  it('calls onSuccess when registration succeeds', async () => {
    const onSuccess = jest.fn();
    mockMutate.mockImplementation((_data, options) => {
      options?.onSuccess?.();
    });

    renderSignUpForm({ onSuccess });

    fireEvent.change(screen.getByTestId('username-input'), {
      target: { value: 'alice' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'Str0ng!pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
