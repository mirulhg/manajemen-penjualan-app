import { useSearchParams } from 'react-router';

import { parsePeriodParams, serializePeriodParams } from '../../../utils/date-period';
import type { Period, PeriodSelection } from '../../../utils/date-period';

// Kemarin tidak ada karena rekap bulanan yang paling sering dibutuhkan; Bulan lalu menjadi bawaan.
export const REPORT_PERIODS: readonly Period[] = ['hari-ini', '7-hari', '30-hari', 'bulan-ini', 'bulan-lalu', '12-bulan', 'rentang'];

const DEFAULT_PERIOD: Period = 'bulan-lalu';

export function useReportPeriod() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selection = parsePeriodParams(searchParams, REPORT_PERIODS, DEFAULT_PERIOD);

  function setSelection(patch: Partial<PeriodSelection>) {
    setSearchParams(serializePeriodParams({ ...selection, ...patch }, new URLSearchParams(), DEFAULT_PERIOD), {
      replace: true,
    });
  }

  return { selection, setSelection };
}
