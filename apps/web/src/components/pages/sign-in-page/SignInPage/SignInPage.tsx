'use client';

import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

import { SignInForm } from '@/components/features/sign-in-form/SignInForm';

import { signInPageStyles } from './SignInPage.styles';

export const SignInPage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <Container maxWidth="sm" sx={signInPageStyles.container}>
      <Stack spacing={2}>
        <Typography component="h1" variant="h4">
          Sign in
        </Typography>
        <SignInForm onSuccess={handleSuccess} />
        <Typography sx={signInPageStyles.linkRow} variant="body2">
          Need an account?{' '}
          <Link component={NextLink} href="/register">
            Sign up
          </Link>
        </Typography>
      </Stack>
    </Container>
  );
};
