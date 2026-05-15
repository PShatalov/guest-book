'use client';

import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

import { SignUpForm } from '@/components/features/sign-up-form/SignUpForm';

import { signUpPageStyles } from './SignUpPage.styles';

export const SignUpPage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <Container maxWidth="sm" sx={signUpPageStyles.container}>
      <Stack spacing={2}>
        <Typography component="h1" variant="h4">
          Sign up
        </Typography>
        <SignUpForm onSuccess={handleSuccess} />
        <Typography sx={signUpPageStyles.linkRow} variant="body2">
          Already have an account?{' '}
          <Link component={NextLink} href="/login">
            Sign in
          </Link>
        </Typography>
      </Stack>
    </Container>
  );
};
