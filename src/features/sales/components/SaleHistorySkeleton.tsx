import { Skeleton } from '@/components/ui/Skeleton';

const SKELETON_ROW_COUNT = 6;

export function SaleHistorySkeleton() {
  return (
    <Skeleton label="Memuat riwayat transaksi">
      <ul className="rounded-md border border-border bg-card">
        {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
          <li
            key={index}
            className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="flex-1">
              <div className="h-4 w-1/2 rounded-md skeleton-bar" />
              <div className="mt-2 h-3 w-2/3 rounded-md skeleton-bar" />
            </div>
            <div className="h-6 w-20 rounded-md skeleton-bar" />
          </li>
        ))}
      </ul>
    </Skeleton>
  );
}
