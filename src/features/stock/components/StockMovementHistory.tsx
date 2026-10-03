import { formatNumber } from '../../../utils/format-number';
import { useStockMovements } from '../api/use-stock-movements';
import { usePageParam } from '../hooks/use-page-param';
import { StockListError } from './StockListError';
import { StockMovementItem } from './StockMovementItem';
import { Pagination } from '../../../components/ui/Pagination';

type StockMovementHistoryProps = {
  productId: string;
  unit: string;
};

const SKELETON_ROW_COUNT = 3;

export function StockMovementHistory({ productId, unit }: StockMovementHistoryProps) {
  const { page: requestedPage, setPage } = usePageParam('halaman');
  const { data, isPending, error, refetch } = useStockMovements(productId, requestedPage);

  function handleRetry() {
    void refetch();
  }

  let content;
  if (isPending) {
    content = (
      <div>
        <p className="sr-only" role="status">
          Memuat riwayat
        </p>
        <ul aria-hidden="true" className="rounded-md border border-border bg-surface">
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
            <li key={index} className="border-b border-border px-4 py-3 last:border-b-0">
              <div className="h-4 w-1/2 rounded-md bg-border" />
              <div className="mt-2 h-4 w-1/3 rounded-md bg-border" />
            </li>
          ))}
        </ul>
      </div>
    );
  } else if (error) {
    content = <StockListError error={error} onRetry={handleRetry} />;
  } else if (data.total === 0) {
    content = <p className="text-text-muted">Belum ada riwayat.</p>;
  } else {
    content = (
      <div className="space-y-4">
        <ol className="rounded-md border border-border bg-surface">
          {data.items.map((movement) => (
            <StockMovementItem key={movement.id} movement={movement} unit={unit} />
          ))}
        </ol>
        <Pagination page={data.page} pageCount={data.pageCount} onPageChange={setPage} />
      </div>
    );
  }

  return (
    <section aria-labelledby="movement-heading" className="mt-8">
      <h2 id="movement-heading" className="text-lg font-semibold">
        Riwayat pergerakan
      </h2>
      {data && <p className="mb-3 text-sm text-text-muted">{formatNumber(data.total)} pergerakan</p>}
      {content}
    </section>
  );
}
