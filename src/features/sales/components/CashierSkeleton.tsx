export function CashierSkeleton() {
  return (
    <div>
      <p className="sr-only" role="status">
        Memuat data barang
      </p>
      <div aria-hidden="true" className="space-y-4">
        <div className="h-11 rounded-md bg-border" />
        <div className="h-32 rounded-md bg-border" />
        <div className="h-24 rounded-md bg-border" />
        <div className="h-12 rounded-md bg-border" />
      </div>
    </div>
  );
}
