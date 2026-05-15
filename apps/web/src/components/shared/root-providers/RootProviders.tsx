'use client';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { ReactNode } from 'react';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';
import { QueryClientProvider } from '@/components/shared/query-client-provider';

export type RootProvidersProps = {
  children: ReactNode;
};

export const RootProviders = ({ children }: RootProvidersProps) => {
  return (
    <AppThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <QueryClientProvider>{children}</QueryClientProvider>
      </LocalizationProvider>
    </AppThemeProvider>
  );
};
