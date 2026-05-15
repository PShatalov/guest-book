import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { RootProviders } from '@/components/shared/root-providers';

export const metadata: Metadata = {
  title: 'Guest Book',
  description: 'Guestbook application frontend',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
