import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import { PRODUCT_ANALYTICS_QUERY_KEY } from '../../../lib/db/product-analytics';
import { downloadBlob, downloadTextFile } from '../../../utils/download-text-file';
import { toLocalDateText } from '../../../utils/date-period';
import type { PeriodSelection } from '../../../utils/date-period';
import { buildProfitReportCsv, buildProfitReportXlsx } from '../profit-report-files';
import { buildReportFileName } from '../report-file-name';
import type { ExportFormat } from '../report-tables';
import { getProfitReport } from './get-profit-report';
import { getReportRange } from './read-report-sales';

export function useProfitReport(selection: PeriodSelection) {
  const now = new Date();

  return useQuery({
    // Berawalan 'product-analytics': penjualan, retur, batal, ubah produk, arsip, dan ganti nama kategori sudah meng-invalidate-nya.
    queryKey: [...PRODUCT_ANALYTICS_QUERY_KEY, 'profit-report', toLocalDateText(now), selection],
    queryFn: () => getProfitReport(selection, now),
    placeholderData: keepPreviousData,
  });
}

export function useProfitReportExport(selection: PeriodSelection) {
  return useMutation({
    mutationFn: async (format: ExportFormat) => {
      const now = new Date();
      const report = await getProfitReport(selection, now);
      const baseName = buildReportFileName('laporan-laba-kotor', getReportRange(selection, now));

      if (format === 'csv') {
        downloadTextFile(`${baseName}.csv`, buildProfitReportCsv(report), 'text/csv;charset=utf-8');
        return;
      }
      downloadBlob(`${baseName}.xlsx`, await buildProfitReportXlsx(report));
    },
  });
}
