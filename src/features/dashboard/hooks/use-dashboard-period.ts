import { useSearchParams } from 'react-router';

import { parsePeriodParams, serializePeriodParams } from '../../../utils/date-period';
import type { Period, PeriodSelection } from '../../../utils/date-period';

// Kemarin tidak ada di dasbor karena sudah ditampilkan sebagai pembanding "hari ini vs kemarin".
export const DASHBOARD_PERIODS: readonly Period[] = ['hari-ini', '7-hari', '30-hari', 'bulan-ini', '12-bulan', 'rentang'];

export function useDashboardPeriod() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selection = parsePeriodParams(searchParams, DASHBOARD_PERIODS);

  function setSelection(patch: Partial<PeriodSelection>) {
    setSearchParams(serializePeriodParams({ ...selection, ...patch }), { replace: true });
  }

  return { selection, setSelection };
}
