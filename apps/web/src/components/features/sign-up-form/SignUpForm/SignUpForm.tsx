'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';

import { useAuthMutations } from '@/components/shared/auth/useAuthMutations';
import { ApiError } from '@/lib/api/apiError';
import { passwordPolicyValidator } from '@/lib/password-policy/passwordPolicyValidator';

import { signUpFormStyles } from './SignUpForm.styles';

export type SignUpFormProps = {
  onSuccess?: () => void;
};

export const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
  const { register } = useAuthMutations();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const clearErrors = () => {
    setUsernameError(null);
    setPasswordErrors([]);
    setSummaryError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearErrors();

    const policyResult = passwordPolicyValidator(password);
    if (!policyResult.isValid) {
      setPasswordErrors(policyResult.violations);
      return;
    }

    register.mutate(
      { username, password },
      {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: (error) => {
          if (!(error instanceof ApiError)) {
            setSummaryError('Something went wrong. Please try again.');
            console.error(error);
            return;
          }

          if (error.status === 409) {
            setUsernameError('This username is already in use.');
            return;
          }

          if (error.status === 400) {
            setSummaryError(error.messages.join(' '));
            return;
          }

          setSummaryError('Something went wrong. Please try again.');
          console.error(error);
        },
      },
    );
  };

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      sx={signUpFormStyles.form}
      noValidate
    >
      {summaryError !== null ? (
        <Alert severity="error" onClose={() => setSummaryError(null)}>
          {summaryError}
        </Alert>
      ) : null}
      <TextField
        autoComplete="username"
        error={usernameError !== null}
        helperText={usernameError ?? undefined}
        label="Username"
        name="username"
        onChange={(event) => setUsername(event.target.value)}
        required
        slotProps={{ htmlInput: { 'data-testid': 'username-input' } }}
        value={username}
      />
      <TextField
        autoComplete="new-password"
        error={passwordErrors.length > 0}
        helperText={
          passwordErrors.length > 0 ? passwordErrors.join(' ') : undefined
        }
        label="Password"
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        required
        slotProps={{ htmlInput: { 'data-testid': 'password-input' } }}
        type="password"
        value={password}
      />
      <Button disabled={register.isPending} type="submit" variant="contained">
        {register.isPending ? 'Creating account…' : 'Sign up'}
      </Button>
    </Stack>
  );
};
