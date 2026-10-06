import { Skeleton } from '@/components/ui/Skeleton';

const SKELETON_FIELD_COUNT = 8;

export function NewProductSkeleton() {
  return (
    <Skeleton label="Memuat formulir">
      <div className="space-y-4">
        {Array.from({ length: SKELETON_FIELD_COUNT }, (_, index) => (
          <div key={index}>
            <div className="h-4 w-1/4 rounded-md skeleton-bar" />
            <div className="mt-2 h-11 rounded-md skeleton-bar" />
          </div>
        ))}
      </div>
    </Skeleton>
  );
}
