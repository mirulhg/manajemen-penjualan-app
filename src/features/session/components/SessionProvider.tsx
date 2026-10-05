import type { ReactNode } from 'react';

import { useSessionQuery } from '../api/use-session';
import { SessionContext } from '../session-context';
import { Button } from '@/components/ui/button';

type SessionProviderProps = {
  children: ReactNode;
};

// Isi aplikasi baru dirender setelah mode dibaca, supaya halaman pemilik tidak sempat berkedip di Mode Kasir.
export function SessionProvider({ children }: SessionProviderProps) {
  const { data: session, error, refetch } = useSessionQuery();

  function handleRetry() {
    void refetch();
  }

  if (error) {
    return (
      <div role="alert" className="mx-auto max-w-3xl p-4">
        <h1 className="text-xl font-semibold">Pengaturan perangkat tidak bisa dibaca</h1>
        <p className="mt-2 text-muted-foreground">
          Aplikasi gagal membaca pengaturan dari penyimpanan di perangkat ini. Coba lagi; jika masih gagal, muat
          ulang halaman.
        </p>
        <Button size="lg" className="mt-4" type="button" onClick={handleRetry}>
          Coba lagi
        </Button>
      </div>
    );
  }
  if (!session) {
    return (
      <p role="status" className="p-4 text-muted-foreground">
        Memuat aplikasi…
      </p>
    );
  }

  return <SessionContext value={session}>{children}</SessionContext>;
}
