export function AdjustStockSkeleton() {
  return (
    <div>
      <p className="sr-only" role="status">
        Memuat data barang
      </p>
      <div aria-hidden="true" className="space-y-6">
        <div className="rounded-md border border-border bg-card p-4">
          <div className="h-5 w-2/3 rounded-md bg-border" />
          <div className="mt-2 h-4 w-1/2 rounded-md bg-border" />
          <div className="mt-4 h-6 w-24 rounded-md bg-border" />
        </div>
        <div className="space-y-4">
          <div className="h-11 rounded-md bg-border" />
          <div className="h-11 rounded-md bg-border" />
          <div className="h-24 rounded-md bg-border" />
        </div>
      </div>
    </div>
  );
}
