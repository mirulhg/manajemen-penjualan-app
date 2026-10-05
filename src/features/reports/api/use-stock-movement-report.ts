import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import { PRODUCT_ANALYTICS_QUERY_KEY } from '../../../lib/db/product-analytics';
import { downloadBlob, downloadTextFile } from '../../../utils/download-text-file';
import { toLocalDateText } from '../../../utils/date-period';
import type { PeriodSelection } from '../../../utils/date-period';
import { buildReportFileName } from '../report-file-name';
import type { ExportFormat } from '../report-tables';
import { buildStockMovementReportCsv, buildStockMovementReportXlsx } from '../stock-movement-report-files';
import { getStockMovementReport } from './get-stock-movement-report';
import { getReportRange } from './read-report-sales';

export function useStockMovementReport(selection: PeriodSelection) {
  const now = new Date();

  return useQuery({
    // Berawalan 'product-analytics': penjualan, penyesuaian, dan perubahan barang sudah meng-invalidate-nya.
    queryKey: [...PRODUCT_ANALYTICS_QUERY_KEY, 'stock-movement-report', toLocalDateText(now), selection],
    queryFn: () => getStockMovementReport(selection, now),
    placeholderData: keepPreviousData,
  });
}

export function useStockMovementReportExport(selection: PeriodSelection) {
  return useMutation({
    mutationFn: async (format: ExportFormat) => {
      const now = new Date();
      const report = await getStockMovementReport(selection, now);
      const baseName = buildReportFileName('laporan-pergerakan-stok', getReportRange(selection, now));

      if (format === 'csv') {
        downloadTextFile(`${baseName}.csv`, buildStockMovementReportCsv(report), 'text/csv;charset=utf-8');
        return;
      }
      downloadBlob(`${baseName}.xlsx`, await buildStockMovementReportXlsx(report));
    },
  });
}
