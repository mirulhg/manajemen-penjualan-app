type ReportErrorProps = {
  error: Error;
  onRetry: () => void;
};

export function ReportError({ error, onRetry }: ReportErrorProps) {
  return (
    <div role="alert" className="space-y-3 print:hidden">
      <h2 className="text-lg font-semibold">Laporan tidak bisa dibuat</h2>
      <p className="text-text-muted">
        Aplikasi gagal membaca data dari penyimpanan di perangkat ini: {error.message}. Coba lagi; jika masih gagal,
        muat ulang halaman.
      </p>
      <button type="button" onClick={onRetry} className="min-h-11 rounded-md bg-primary px-4 font-medium text-on-primary">
        Coba lagi
      </button>
    </div>
  );
}
