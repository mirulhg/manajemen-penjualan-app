import { Alert } from '@/components/ui/alert';
import { PageShell } from '../components/layout/PageShell';

type StartupErrorProps = {
  error: unknown;
};

export function StartupError({ error }: StartupErrorProps) {
  const detail = error instanceof Error ? error.message : String(error);

  return (
    <PageShell brand={<p className="text-lg font-semibold">Manajemen Stok</p>}>
      <h1 className="text-xl font-semibold">Aplikasi gagal dimulai</h1>
      <p className="mt-2 text-muted-foreground">
        Penyimpanan data di perangkat ini tidak bisa disiapkan. Muat ulang halaman; jika masih gagal,
        periksa apakah browser memblokir penyimpanan situs.
      </p>
      <Alert variant="destructive" className="mt-4 p-4">
        {detail}
      </Alert>
    </PageShell>
  );
}
