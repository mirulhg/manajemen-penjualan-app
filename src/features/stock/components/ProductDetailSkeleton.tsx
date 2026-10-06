import { Skeleton } from '@/components/ui/Skeleton';

const SKELETON_ROW_COUNT = 6;

export function ProductDetailSkeleton() {
  return (
    <Skeleton label="Memuat detail barang">
      <div className="rounded-md border border-border bg-card p-4">
        <div className="h-5 w-2/3 rounded-md skeleton-bar" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
            <div key={index}>
              <div className="h-3 w-1/3 rounded-md skeleton-bar" />
              <div className="mt-2 h-4 w-1/2 rounded-md skeleton-bar" />
            </div>
          ))}
        </div>
      </div>
    </Skeleton>
  );
}
