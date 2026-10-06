import { Skeleton } from '@/components/ui/Skeleton';

const SKELETON_ROW_COUNT = 5;

export function CategoriesSkeleton() {
  return (
    <Skeleton label="Memuat kategori">
      <ul className="rounded-md border border-border bg-card">
        {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
          <li key={index} className="border-b border-border px-4 py-3">
            <div className="h-4 w-1/3 rounded-md skeleton-bar" />
            <div className="mt-2 h-3 w-1/4 rounded-md skeleton-bar" />
          </li>
        ))}
      </ul>
    </Skeleton>
  );
}
