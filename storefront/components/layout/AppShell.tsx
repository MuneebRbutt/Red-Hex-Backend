'use client';

import Header from '@/components/layout/Header';
import { usePathname } from 'next/navigation';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <WhatsAppButton />
    </>
  );
}
