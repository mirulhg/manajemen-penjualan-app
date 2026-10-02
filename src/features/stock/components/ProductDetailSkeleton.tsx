const SKELETON_ROW_COUNT = 6;

export function ProductDetailSkeleton() {
  return (
    <div>
      <p className="sr-only" role="status">
        Memuat detail barang
      </p>
      <div aria-hidden="true" className="rounded-md border border-border bg-surface p-4">
        <div className="h-5 w-2/3 rounded-md bg-border" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
            <div key={index}>
              <div className="h-3 w-1/3 rounded-md bg-border" />
              <div className="mt-2 h-4 w-1/2 rounded-md bg-border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
