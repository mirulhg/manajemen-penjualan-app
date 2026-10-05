import { Button } from '@/components/ui/button';
type DashboardErrorProps = {
  error: Error;
  onRetry: () => void;
};

export function DashboardError({ error, onRetry }: DashboardErrorProps) {
  return (
    <div role="alert">
      <h2 className="text-lg font-semibold">Angka penjualan tidak bisa dibaca</h2>
      <p className="mt-2 text-muted-foreground">
        Aplikasi gagal membaca rekap penjualan dari penyimpanan di perangkat ini. Coba lagi; jika masih gagal,
        muat ulang halaman.
      </p>
      <p className="mt-4 rounded-md border border-border bg-card p-4 text-sm">{error.message}</p>
      <Button size="lg" className="mt-4" type="button" onClick={onRetry}>
        Coba lagi
      </Button>
    </div>
  );
}
