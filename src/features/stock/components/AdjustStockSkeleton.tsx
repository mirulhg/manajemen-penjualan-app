import { Skeleton } from '@/components/ui/Skeleton';

export function AdjustStockSkeleton() {
  return (
    <Skeleton label="Memuat data barang">
      <div className="space-y-6">
        <div className="rounded-md border border-border bg-card p-4">
          <div className="h-5 w-2/3 rounded-md skeleton-bar" />
          <div className="mt-2 h-4 w-1/2 rounded-md skeleton-bar" />
          <div className="mt-4 h-6 w-24 rounded-md skeleton-bar" />
        </div>
        <div className="space-y-4">
          <div className="h-11 rounded-md skeleton-bar" />
          <div className="h-11 rounded-md skeleton-bar" />
          <div className="h-24 rounded-md skeleton-bar" />
        </div>
      </div>
    </Skeleton>
  );
}
