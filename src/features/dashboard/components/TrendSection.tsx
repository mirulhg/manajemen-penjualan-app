import { useMediaQuery } from '../../../hooks/use-media-query';
import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import { LineChart } from '../../../components/ui/LineChart';
import { bucketDailySales, defaultGranularity } from '../../../lib/db/daily-sales-buckets';
import type { Granularity, SalesBucket } from '../../../lib/db/daily-sales-buckets';
import type { DateRange } from '../../../utils/date-period';
import { formatCompactRupiah } from '../../../utils/format-compact-rupiah';
import { formatRupiah } from '../../../utils/format-rupiah';
import { useTrendRows } from '../api/use-trend-rows';
import { GRANULARITIES } from '../hooks/use-dashboard-period';
import { ChartSection } from './ChartSection';

type TrendSectionProps = {
  current: DateRange;
  previous: DateRange;
  granularity: Granularity | null;
  onGranularityChange: (granularity: Granularity) => void;
};

const GRANULARITY_LABELS: Record<Granularity, string> = {
  harian: 'Harian',
  mingguan: 'Mingguan',
  bulanan: 'Bulanan',
};

function toPoints(buckets: SalesBucket[]) {
  return buckets.map((bucket) => ({
    label: bucket.label,
    shortLabel: bucket.shortLabel,
    value: bucket.metrics.revenue,
  }));
}

function findGranularity(value: string): Granularity {
  return GRANULARITIES.find((option) => option === value) ?? 'harian';
}

export function TrendSection({ current, previous, granularity, onGranularityChange }: TrendSectionProps) {
  const { data: rows, isPending, error, refetch } = useTrendRows(previous, current);
  const scale = granularity ?? defaultGranularity(current);
  const isCard = useMediaQuery('(min-width: 48rem)');

  function handleRetry() {
    void refetch();
  }

  function handleScaleChange(value: string) {
    onGranularityChange(findGranularity(value));
  }

  const currentBuckets = rows ? bucketDailySales(rows, current, scale) : [];
  const previousBuckets = rows ? bucketDailySales(rows, previous, scale) : [];
  const hasSales = currentBuckets.some((bucket) => bucket.metrics.transactionCount > 0);

  // md ke atas: pemilih skala di header kartu (labelnya hanya untuk pembaca layar). Di HP tetap di atas grafik; satu salinan saja.
  const scaleField = (
    <FormField id="trend-scale" label="Skala waktu" error={undefined}>
      {(control) => (
        <select
          {...control}
          value={scale}
          onChange={(event) => handleScaleChange(event.target.value)}
          className={FIELD_CLASS}
        >
          {GRANULARITIES.map((option) => (
            <option key={option} value={option}>
              {GRANULARITY_LABELS[option]}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );

  return (
    <ChartSection
      title="Tren omzet"
      isPending={isPending}
      error={error}
      isEmpty={!hasSales}
      onRetry={handleRetry}
      action={isCard ? <div className="w-36 [&_label]:sr-only [&_select]:mt-0">{scaleField}</div> : undefined}
    >
      <div className="space-y-3">
        {!isCard && scaleField}
        <LineChart
          title="Omzet per periode"
          series={[
            { name: 'Periode ini', shortName: 'Periode ini', points: toPoints(currentBuckets) },
            ...(previousBuckets.length > 0 ? [{ name: 'Periode sebelumnya', shortName: 'Sebelumnya', points: toPoints(previousBuckets) }] : []),
          ]}
          formatValue={formatRupiah}
          formatAxis={formatCompactRupiah}
          labelHeader="Tanggal"
        />
      </div>
    </ChartSection>
  );
}
