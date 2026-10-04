import { BarChart } from '../../../components/ui/BarChart';
import type { DateRange } from '../../../utils/date-period';
import { formatRupiah } from '../../../utils/format-rupiah';
import { useRevenueByCategory } from '../api/use-revenue-by-category';
import { ChartSection } from './ChartSection';

type CategorySectionProps = {
  range: DateRange;
};

export function CategorySection({ range }: CategorySectionProps) {
  const { data, isPending, error, refetch } = useRevenueByCategory(range);

  function handleRetry() {
    void refetch();
  }

  const total = data?.reduce((sum, entry) => sum + entry.revenue, 0) ?? 0;

  return (
    <ChartSection
      title="Omzet per kategori"
      isPending={isPending}
      error={error}
      isEmpty={!data || data.length === 0}
      onRetry={handleRetry}
    >
      <div className="space-y-2">
        <BarChart
          title="Omzet per kategori produk"
          data={(data ?? []).map((entry) => ({ label: entry.category, value: entry.revenue }))}
          orientation="horizontal"
          formatValue={formatRupiah}
          columns={{ label: 'Kategori', value: 'Omzet' }}
        />
        <p className="font-medium">Total {formatRupiah(total)}</p>
      </div>
    </ChartSection>
  );
}
