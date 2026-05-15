'use client';

import {
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

export type QueryClientProviderProps = {
  children: ReactNode;
};

export const QueryClientProvider = ({ children }: QueryClientProviderProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
          },
        },
      }),
  );

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
      {isDevelopment ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </TanStackQueryClientProvider>
  );
};
