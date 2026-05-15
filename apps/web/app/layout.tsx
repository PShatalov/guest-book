import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AppLayout } from '@/components/shared/app-layout/AppLayout';
import { RootProviders } from '@/components/shared/root-providers';

export const metadata: Metadata = {
  title: 'Guest Book',
  description: 'Guestbook application frontend',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootProviders>
          <AppLayout>{children}</AppLayout>
        </RootProviders>
      </body>
    </html>
  );
}
