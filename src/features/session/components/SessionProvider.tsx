import type { ReactNode } from 'react';

import { useSessionQuery } from '../api/use-session';
import { SessionContext } from '../session-context';

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
        <button
          type="button"
          onClick={handleRetry}
          className="mt-4 min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground"
        >
          Coba lagi
        </button>
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
