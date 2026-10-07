import type { Granularity } from '../../../lib/db/daily-sales-buckets';
import type { PeriodSelection } from '../../../utils/date-period';
import { getDashboardRanges } from '../dashboard-range';
import { CategorySection } from './CategorySection';
import { HourSection } from './HourSection';
import { TrendSection } from './TrendSection';

type ChartsSectionProps = {
  selection: PeriodSelection;
  granularity: Granularity | null;
  onGranularityChange: (granularity: Granularity) => void;
};

// Dimuat lazy dari DashboardContent: kartu angka muncul lebih dulu, kode grafik menyusul.
export function ChartsSection({ selection, granularity, onGranularityChange }: ChartsSectionProps) {
  const { current, previous } = getDashboardRanges(selection, new Date());

  return (
    <>
      <div className="md:col-span-full lg:col-span-3">
        <TrendSection
          current={current}
          previous={previous}
          granularity={granularity}
          onGranularityChange={onGranularityChange}
        />
      </div>
      <div>
        <HourSection range={current} />
      </div>
      <div className="lg:col-span-2">
        <CategorySection range={current} />
      </div>
    </>
  );
}
