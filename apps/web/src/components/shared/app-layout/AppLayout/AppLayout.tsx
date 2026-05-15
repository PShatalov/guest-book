'use client';

import type { ReactNode } from 'react';

import { AppShell } from '@/components/shared/app-shell/AppShell';
import { AuthNavSession } from '@/components/features/auth-nav-session/AuthNavSession';

export type AppLayoutProps = {
  children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  return <AppShell sessionSlot={<AuthNavSession />}>{children}</AppShell>;
};
