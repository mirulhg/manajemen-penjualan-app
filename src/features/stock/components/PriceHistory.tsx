import { Pagination } from '../../../components/ui/Pagination';
import { usePriceChanges } from '../api/use-price-changes';
import { usePageParam } from '../hooks/use-page-param';
import { PriceChangeItem } from './PriceChangeItem';
import { StockListError } from './StockListError';

type PriceHistoryProps = {
  productId: string;
};

export function PriceHistory({ productId }: PriceHistoryProps) {
  const { page: requestedPage, setPage } = usePageParam('halaman-harga');
  const { data, isPending, error, refetch } = usePriceChanges(productId, requestedPage);

  function handleRetry() {
    void refetch();
  }

  let content;
  if (isPending) {
    content = (
      <p className="sr-only" role="status">
        Memuat riwayat harga
      </p>
    );
  } else if (error) {
    content = <StockListError error={error} onRetry={handleRetry} />;
  } else if (data.total === 0) {
    content = <p className="text-muted-foreground">Belum ada perubahan harga.</p>;
  } else {
    content = (
      <div className="space-y-4">
        <ul className="rounded-md border border-border bg-card">
          {data.items.map((change) => (
            <PriceChangeItem key={change.id} change={change} />
          ))}
        </ul>
        <Pagination page={data.page} pageCount={data.pageCount} onPageChange={setPage} />
      </div>
    );
  }

  return (
    <section aria-labelledby="price-history-heading" className="mt-8">
      <h2 id="price-history-heading" className="mb-3 text-lg font-semibold">
        Riwayat harga
      </h2>
      {content}
    </section>
  );
}
