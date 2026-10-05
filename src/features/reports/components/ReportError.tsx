import { Button } from '@/components/ui/button';
type ReportErrorProps = {
  error: Error;
  onRetry: () => void;
};

export function ReportError({ error, onRetry }: ReportErrorProps) {
  return (
    <div role="alert" className="space-y-3 print:hidden">
      <h2 className="text-lg font-semibold">Laporan tidak bisa dibuat</h2>
      <p className="text-muted-foreground">
        Aplikasi gagal membaca data dari penyimpanan di perangkat ini: {error.message}. Coba lagi; jika masih gagal,
        muat ulang halaman.
      </p>
      <Button size="lg" type="button" onClick={onRetry}>
        Coba lagi
      </Button>
    </div>
  );
}
