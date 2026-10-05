import { Pagination } from '../../../components/ui/Pagination';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import { StockListError } from '../../stock';
import { useSales } from '../api/use-sales';
import type { SaleFilters } from '../sale-filters';
import { SaleHistoryItem } from './SaleHistoryItem';
import { SaleHistorySkeleton } from './SaleHistorySkeleton';

type SaleHistoryResultsProps = {
  filters: SaleFilters;
  onPageChange: (page: number) => void;
};

export function SaleHistoryResults({ filters, onPageChange }: SaleHistoryResultsProps) {
  const { data, isPending, error, refetch } = useSales(filters);

  function handleRetry() {
    void refetch();
  }

  if (isPending) return <SaleHistorySkeleton />;
  if (error) return <StockListError error={error} onRetry={handleRetry} />;
  if (data.total === 0) return <p className="text-muted-foreground">Belum ada transaksi di periode ini.</p>;

  return (
    <div className="space-y-4">
      <p aria-live="polite" className="font-medium">
        {formatNumber(data.summary.count)} transaksi · Omzet {formatRupiah(data.summary.netRevenue)}
      </p>
      <ul className="rounded-md border border-border bg-card">
        {data.items.map((sale) => (
          <SaleHistoryItem key={sale.id} sale={sale} />
        ))}
      </ul>
      <Pagination page={data.page} pageCount={data.pageCount} onPageChange={onPageChange} />
    </div>
  );
}
