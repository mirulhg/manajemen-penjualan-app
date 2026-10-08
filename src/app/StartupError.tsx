import { DatabaseZap } from 'lucide-react';

import { ErrorScreen } from '@/components/ui/ErrorScreen';
import { ReloadButton } from '@/components/ui/ReloadButton';
import { PageShell } from '../components/layout/PageShell';

type StartupErrorProps = {
  error: unknown;
};

export function StartupError({ error }: StartupErrorProps) {
  const detail = error instanceof Error ? error.message : String(error);

  return (
    <PageShell brand={<p className="text-lg font-semibold">Manajemen Stok</p>}>
      <ErrorScreen
        icon={DatabaseZap}
        title="Aplikasi gagal dimulai"
        description="Data toko di perangkat ini tidak bisa disiapkan. Muat ulang halaman. Kalau masih gagal, pastikan browser tidak memblokir penyimpanan data untuk situs ini (misalnya mode penyamaran atau pengaturan privasi)."
        detail={detail}
      >
        <ReloadButton />
      </ErrorScreen>
    </PageShell>
  );
}
