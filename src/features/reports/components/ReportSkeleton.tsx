import { Skeleton } from '@/components/ui/Skeleton';

export function ReportSkeleton() {
  return (
    <Skeleton label="Memuat laporan">
      <div className="space-y-6">
        <div className="h-4 w-1/2 rounded-md skeleton-bar" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="rounded-md border border-border p-3">
              <div className="h-3 w-1/2 rounded-md skeleton-bar" />
              <div className="mt-2 h-5 w-2/3 rounded-md skeleton-bar" />
            </div>
          ))}
        </div>
        <div className="h-32 rounded-md skeleton-bar" />
      </div>
    </Skeleton>
  );
}
