type DashboardErrorProps = {
  error: Error;
  onRetry: () => void;
};

export function DashboardError({ error, onRetry }: DashboardErrorProps) {
  return (
    <div role="alert">
      <h2 className="text-lg font-semibold">Angka penjualan tidak bisa dibaca</h2>
      <p className="mt-2 text-text-muted">
        Aplikasi gagal membaca rekap penjualan dari penyimpanan di perangkat ini. Coba lagi; jika masih gagal,
        muat ulang halaman.
      </p>
      <p className="mt-4 rounded-md border border-border bg-surface p-4 text-sm">{error.message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 min-h-11 rounded-md bg-primary px-4 font-medium text-on-primary"
      >
        Coba lagi
      </button>
    </div>
  );
}
