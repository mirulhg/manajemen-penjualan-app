const SKELETON_ROW_COUNT = 8;

export function StockListSkeleton() {
  return (
    <div>
      <p className="sr-only" role="status">
        Memuat data stok
      </p>
      <ul aria-hidden="true" className="rounded-md border border-border bg-card">
        {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
          <li
            key={index}
            className="flex items-center justify-between gap-4 border-b border-border px-4 py-3"
          >
            <div className="flex-1">
              <div className="h-4 w-1/2 rounded-md bg-border" />
              <div className="mt-2 h-3 w-1/3 rounded-md bg-border" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="h-4 w-12 rounded-md bg-border" />
              <div className="h-6 w-16 rounded-md bg-border" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
