import { Skeleton } from '@/components/ui/Skeleton';

export function SaleDetailSkeleton() {
  return (
    <Skeleton label="Memuat detail transaksi">
      <div className="space-y-4">
        <div className="h-32 rounded-md border border-border skeleton-bar" />
        <div className="h-40 rounded-md border border-border skeleton-bar" />
      </div>
    </Skeleton>
  );
}
