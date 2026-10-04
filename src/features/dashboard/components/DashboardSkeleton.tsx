const CARD_COUNT = 4;

function SkeletonCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: CARD_COUNT }, (_, index) => (
        <div key={index} className="rounded-md border border-border bg-surface p-4">
          <div className="h-3 w-1/3 rounded-md bg-border" />
          <div className="mt-3 h-7 w-2/3 rounded-md bg-border" />
          <div className="mt-3 h-3 w-1/2 rounded-md bg-border" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <p className="sr-only" role="status">
        Memuat dasbor
      </p>
      <div aria-hidden="true" className="space-y-8">
        <SkeletonCards />
        <SkeletonCards />
      </div>
    </div>
  );
}
