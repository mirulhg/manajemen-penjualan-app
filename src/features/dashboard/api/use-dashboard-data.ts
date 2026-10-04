import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { DAILY_SALES_QUERY_KEY } from '../../../lib/db/daily-sales';
import { toLocalDateText } from '../../../utils/date-period';
import type { PeriodSelection } from '../../../utils/date-period';
import { getDashboardData } from './get-dashboard-data';

export function useDashboardData(selection: PeriodSelection) {
  const now = new Date();

  return useQuery({
    // Tanggal hari ini ada di key supaya dasbor yang dibiarkan terbuka lewat tengah malam membaca "hari ini" yang baru.
    queryKey: [...DAILY_SALES_QUERY_KEY, 'dashboard', toLocalDateText(now), selection],
    queryFn: () => getDashboardData(selection, now),
    // Ganti periode tidak mengosongkan layar sambil menunggu angka baru.
    placeholderData: keepPreviousData,
  });
}
