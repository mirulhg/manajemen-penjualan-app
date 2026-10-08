import { DatabaseZap } from 'lucide-react';
import type { ReactNode } from 'react';

import { useSessionQuery } from '../api/use-session';
import { SessionContext } from '../session-context';
import { Button } from '@/components/ui/button';
import { ErrorScreen } from '@/components/ui/ErrorScreen';
import { ReloadButton } from '@/components/ui/ReloadButton';
import { PageShell } from '../../../components/layout/PageShell';

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
      <PageShell brand={<p className="text-lg font-semibold">Manajemen Stok</p>}>
        <div role="alert">
          <ErrorScreen
            icon={DatabaseZap}
            title="Data di perangkat ini tidak bisa dibuka"
            description="Aplikasi gagal membaca pengaturan dari penyimpanan di perangkat ini. Coba lagi; kalau masih gagal, muat ulang halaman."
            detail={error.message}
          >
            <Button size="lg" type="button" onClick={handleRetry}>
              Coba lagi
            </Button>
            <ReloadButton variant="outline" />
          </ErrorScreen>
        </div>
      </PageShell>
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
