import { BarChart } from '../../../components/ui/BarChart';
import type { DateRange } from '../../../utils/date-period';
import { formatNumber } from '../../../utils/format-number';
import { topByQuantity } from '../../../lib/db/product-analytics-rows';
import { useProductSales } from '../api/use-product-analysis';
import { ChartSection } from './ChartSection';

type TopSellingSectionProps = {
  range: DateRange;
};

const TOP_LIMIT = 10;

export function TopSellingSection({ range }: TopSellingSectionProps) {
  const { data, isPending, error, refetch } = useProductSales(range);

  function handleRetry() {
    void refetch();
  }

  const top = data ? topByQuantity(data, TOP_LIMIT) : [];

  return (
    <ChartSection title="Terlaris" status={{ isPending, error, isEmpty: top.length === 0, onRetry: handleRetry }}>
      <BarChart
        title="10 produk dengan jumlah terjual terbanyak"
        data={top.map((row) => ({
          label: row.isArchived ? `${row.name} (Diarsipkan)` : row.name,
          value: row.quantity,
          href: `/stok/${row.productId}`,
        }))}
        orientation="horizontal"
        formatValue={formatNumber}
        columns={{ label: 'Produk', value: 'Terjual' }}
      />
    </ChartSection>
  );
}
