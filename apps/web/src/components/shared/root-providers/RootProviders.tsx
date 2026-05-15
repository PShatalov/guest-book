'use client';

import type { ReactNode } from 'react';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';
import { QueryClientProvider } from '@/components/shared/query-client-provider';

export type RootProvidersProps = {
  children: ReactNode;
};

export const RootProviders = ({ children }: RootProvidersProps) => {
  return (
    <AppThemeProvider>
      <QueryClientProvider>{children}</QueryClientProvider>
    </AppThemeProvider>
  );
};
