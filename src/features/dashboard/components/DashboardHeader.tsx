import { HelpLink } from '../../help';
import { useMediaQuery } from '../../../hooks/use-media-query';
import { PeriodSegmented } from '../../../components/ui/PeriodSegmented';
import { formatLocalDate } from '../../../utils/format-date-time';
import { toLocalDateText } from '../../../utils/date-period';
import { useDashboardPeriod } from '../hooks/use-dashboard-period';
import { describePeriodComparison } from '../period-description';

// Di lg ke atas pemilih periode duduk di kanan judul. Di bawah itu pemilih tetap di dalam grid (di bawah kartu restock),
// jadi hanya satu salinan yang dirender: urutan DOM = urutan tampilan, dan tidak ada kontrol ganda.
export const DASHBOARD_HEADER_QUERY = '(min-width: 64rem)';

export function DashboardHeader() {
  const { selection, setSelection } = useDashboardPeriod();
  const isLarge = useMediaQuery(DASHBOARD_HEADER_QUERY);

  return (
    <div className="mb-4 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-1">
          <h1 className="text-xl font-semibold">Dasbor</h1>
          <HelpLink topic="dasbor" />
        </div>
        <p className="hidden text-sm text-muted-foreground lg:block">
          {formatLocalDate(toLocalDateText(new Date()))} · {describePeriodComparison(selection.period)}
        </p>
      </div>
      {isLarge && (
        <div className="lg:w-96">
          <PeriodSegmented selection={selection} onChange={setSelection} />
        </div>
      )}
    </div>
  );
}
