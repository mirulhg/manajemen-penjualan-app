import type { PeriodSelection } from '../../../utils/date-period';
import { useSalesReportExport } from './use-sales-report-export';

const LAST_MONTH: PeriodSelection = { period: 'bulan-lalu', from: null, to: null };

// Dipakai palette perintah (app/) untuk aksi cepat tanpa membuka halaman laporan; selalu CSV.
export function useLastMonthSalesDownload() {
  const { mutate, isPending } = useSalesReportExport(LAST_MONTH);

  function download(onError: (error: Error) => void) {
    mutate('csv', { onError });
  }

  return { download, isPending };
}
