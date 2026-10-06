const CARD_COUNT = 4;

export function DashboardSkeleton() {
  return (
    <div>
      <p className="sr-only" role="status">
        Memuat dasbor
      </p>
      <div aria-hidden="true" className="space-y-6">
        <div className="h-13 rounded-md bg-border" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: CARD_COUNT }, (_, index) => (
            <div key={index} className="rounded-md border border-border bg-card p-4">
              <div className="h-3 w-1/3 rounded-md bg-border" />
              <div className="mt-3 h-7 w-2/3 rounded-md bg-border" />
              <div className="mt-3 h-3 w-1/2 rounded-md bg-border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
