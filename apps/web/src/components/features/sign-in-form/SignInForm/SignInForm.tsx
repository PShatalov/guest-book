'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';

import { useAuthMutations } from '@/components/shared/auth/useAuthMutations';
import { ApiError } from '@/lib/api/apiError';

import { signInFormStyles } from './SignInForm.styles';

const INVALID_CREDENTIALS_MESSAGE =
  'Invalid username or password. Please try again.';

export type SignInFormProps = {
  onSuccess?: () => void;
};

export const SignInForm = ({ onSuccess }: SignInFormProps) => {
  const { login } = useAuthMutations();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    login.mutate(
      { username, password },
      {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 401) {
            setFormError(INVALID_CREDENTIALS_MESSAGE);
            return;
          }

          setFormError('Something went wrong. Please try again.');
          console.error(error);
        },
      },
    );
  };

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      sx={signInFormStyles.form}
      noValidate
    >
      {formError !== null ? (
        <Alert severity="error" onClose={() => setFormError(null)} role="alert">
          {formError}
        </Alert>
      ) : null}
      <TextField
        autoComplete="username"
        label="Username"
        name="username"
        onChange={(event) => setUsername(event.target.value)}
        required
        slotProps={{ htmlInput: { 'data-testid': 'username-input' } }}
        value={username}
      />
      <TextField
        autoComplete="current-password"
        label="Password"
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        required
        slotProps={{ htmlInput: { 'data-testid': 'password-input' } }}
        type="password"
        value={password}
      />
      <Button disabled={login.isPending} type="submit" variant="contained">
        {login.isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </Stack>
  );
};
