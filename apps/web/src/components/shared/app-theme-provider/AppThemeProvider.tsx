'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { appTheme } from '@/theme/theme';

export type AppThemeProviderProps = {
  children: ReactNode;
  theme?: Theme;
};

export const AppThemeProvider = ({
  children,
  theme = appTheme,
}: AppThemeProviderProps) => {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};
