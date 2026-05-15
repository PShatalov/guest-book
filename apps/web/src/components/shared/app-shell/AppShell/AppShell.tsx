'use client';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { useAuthSession } from '@/components/shared/auth/useAuthSession';

import { appShellStyles } from './AppShell.styles';

export type AppShellProps = {
  children: ReactNode;
  sessionSlot?: ReactNode;
};

export const AppShell = ({ children, sessionSlot }: AppShellProps) => {
  const { username, isPending } = useAuthSession();
  const isAuthenticated = username !== null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar sx={appShellStyles.toolbar}>
          <Typography
            component={Link}
            href="/"
            variant="h6"
            sx={{ color: 'inherit', textDecoration: 'none' }}
          >
            Guest Book
          </Typography>
          <Box sx={appShellStyles.navLinks}>
            {isPending ? (
              <Skeleton width={120} height={32} data-testid="nav-session-loading" />
            ) : isAuthenticated ? (
              sessionSlot
            ) : (
              <>
                <Button color="inherit" component={Link} href="/login">
                  Sign in
                </Button>
                <Button color="inherit" component={Link} href="/register" variant="outlined">
                  Sign up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={appShellStyles.main}>
        {children}
      </Box>
    </Box>
  );
};
