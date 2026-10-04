import { BarChart } from '../../../components/ui/BarChart';
import { trimHours } from '../../../lib/db/sales-analytics-rows';
import type { DateRange } from '../../../utils/date-period';
import { formatNumber } from '../../../utils/format-number';
import { useTransactionsByHour } from '../api/use-transactions-by-hour';
import { ChartSection } from './ChartSection';

type HourSectionProps = {
  range: DateRange;
};

export function HourSection({ range }: HourSectionProps) {
  const { data, isPending, error, refetch } = useTransactionsByHour(range);

  function handleRetry() {
    void refetch();
  }

  const hours = data ? trimHours(data) : [];

  return (
    <ChartSection title="Jam sibuk" isPending={isPending} error={error} isEmpty={hours.length === 0} onRetry={handleRetry}>
      <BarChart
        title="Jumlah transaksi per jam"
        data={hours.map(({ hour, count }) => ({ label: String(hour).padStart(2, '0'), value: count }))}
        orientation="vertical"
        formatValue={formatNumber}
        columns={{ label: 'Jam', value: 'Transaksi' }}
      />
    </ChartSection>
  );
}
