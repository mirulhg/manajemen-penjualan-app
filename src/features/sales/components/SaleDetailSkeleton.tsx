export function SaleDetailSkeleton() {
  return (
    <div>
      <p className="sr-only" role="status">
        Memuat detail transaksi
      </p>
      <div aria-hidden="true" className="space-y-4">
        <div className="h-32 rounded-md border border-border bg-border" />
        <div className="h-40 rounded-md border border-border bg-border" />
      </div>
    </div>
  );
}
