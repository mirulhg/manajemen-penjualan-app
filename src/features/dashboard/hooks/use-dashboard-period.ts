import { useSearchParams } from 'react-router';

import type { Granularity } from '../../../lib/db/daily-sales-buckets';
import { parsePeriodParams, serializePeriodParams } from '../../../utils/date-period';
import type { Period, PeriodSelection } from '../../../utils/date-period';

// Kemarin tidak ada di dasbor karena sudah ditampilkan sebagai pembanding "hari ini vs kemarin".
export const DASHBOARD_PERIODS: readonly Period[] = ['hari-ini', '7-hari', '30-hari', 'bulan-ini', '12-bulan', 'rentang'];

export const GRANULARITIES: readonly Granularity[] = ['harian', 'mingguan', 'bulanan'];

export function useDashboardPeriod() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selection = parsePeriodParams(searchParams, DASHBOARD_PERIODS);
  // null = otomatis menurut panjang periode; nilai tidak valid dianggap otomatis.
  const granularity = GRANULARITIES.find((option) => option === searchParams.get('skala')) ?? null;

  // Mengganti periode menghapus ?skala= supaya skala kembali otomatis untuk periode baru.
  function setSelection(patch: Partial<PeriodSelection>) {
    setSearchParams(serializePeriodParams({ ...selection, ...patch }), { replace: true });
  }

  function setGranularity(next: Granularity) {
    const params = new URLSearchParams(searchParams);
    params.set('skala', next);
    setSearchParams(params, { replace: true });
  }

  return { selection, granularity, setSelection, setGranularity };
}
