import { PageShell } from '../components/layout/PageShell';

type StartupErrorProps = {
  error: unknown;
};

export function StartupError({ error }: StartupErrorProps) {
  const detail = error instanceof Error ? error.message : String(error);

  return (
    <PageShell>
      <h1 className="text-xl font-semibold">Aplikasi gagal dimulai</h1>
      <p className="mt-2 text-text-muted">
        Penyimpanan data di perangkat ini tidak bisa disiapkan. Muat ulang halaman; jika masih gagal,
        periksa apakah browser memblokir penyimpanan situs.
      </p>
      <p className="mt-4 rounded-md border border-border bg-surface p-4 text-sm">{detail}</p>
    </PageShell>
  );
}
