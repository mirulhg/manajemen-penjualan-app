type StockListErrorProps = {
  error: Error;
  onRetry: () => void;
};

export function StockListError({ error, onRetry }: StockListErrorProps) {
  return (
    <div role="alert">
      <h2 className="text-lg font-semibold">Data stok tidak bisa dibaca</h2>
      <p className="mt-2 text-muted-foreground">
        Aplikasi gagal membaca data dari penyimpanan di perangkat ini. Coba lagi; jika masih gagal,
        muat ulang halaman.
      </p>
      <p className="mt-4 rounded-md border border-border bg-card p-4 text-sm">{error.message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground"
      >
        Coba lagi
      </button>
    </div>
  );
}
