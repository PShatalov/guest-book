'use client';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { useAuthMutations } from '@/components/shared/auth/useAuthMutations';
import { useAuthSession } from '@/components/shared/auth/useAuthSession';

import { authNavSessionStyles } from './AuthNavSession.styles';

export const AuthNavSession = () => {
  const { username } = useAuthSession();
  const { logout } = useAuthMutations();

  if (username === null) {
    return null;
  }

  const handleLogoutClick = () => {
    logout.mutate();
  };

  return (
    <Box sx={authNavSessionStyles.root}>
      <Typography variant="body2" data-testid="nav-username">
        {username}
      </Typography>
      <Button
        color="inherit"
        disabled={logout.isPending}
        onClick={handleLogoutClick}
        size="small"
      >
        Log out
      </Button>
    </Box>
  );
};
