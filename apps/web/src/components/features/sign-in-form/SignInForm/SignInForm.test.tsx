import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';
import { ApiError } from '@/lib/api/apiError';

import { SignInForm } from './SignInForm';

const renderSignInForm = () =>
  render(
    <AppThemeProvider>
      <SignInForm />
    </AppThemeProvider>,
  );

const mockMutate = jest.fn();

jest.mock('@/components/shared/auth/useAuthMutations', () => ({
  useAuthMutations: () => ({
    register: { mutate: jest.fn(), isPending: false },
    login: {
      mutate: mockMutate,
      isPending: false,
    },
    logout: { mutate: jest.fn(), isPending: false },
  }),
}));

describe('SignInForm', () => {
  beforeEach(() => {
    mockMutate.mockReset();
  });

  it('shows a generic invalid credentials message on 401', async () => {
    mockMutate.mockImplementation((_data, options) => {
      options?.onError?.(new ApiError(401, 'Invalid credentials'));
    });

    renderSignInForm();

    fireEvent.change(screen.getByTestId('username-input'), {
      target: { value: 'alice' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/invalid username or password/i),
      ).toBeInTheDocument();
    });
  });
});
