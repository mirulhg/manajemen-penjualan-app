import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import { PRODUCT_ANALYTICS_QUERY_KEY } from '../../../lib/db/product-analytics';
import { downloadBlob, downloadTextFile } from '../../../utils/download-text-file';
import { toLocalDateText } from '../../../utils/date-period';
import { buildStockReportCsv, buildStockReportXlsx } from '../stock-report-files';
import type { ExportFormat } from '../report-tables';
import { getStockReport, StockReportError } from './get-stock-report';

export function useStockReport(date: string) {
  const now = new Date();

  return useQuery({
    // Berawalan 'product-analytics': data barang, harga, dan stok yang berubah sudah meng-invalidate-nya.
    queryKey: [...PRODUCT_ANALYTICS_QUERY_KEY, 'stock-report', toLocalDateText(now), date],
    queryFn: () => getStockReport(date, now),
    placeholderData: keepPreviousData,
    // Tanggal yang salah tidak akan benar dengan diulang.
    retry: (failureCount, error) => !(error instanceof StockReportError) && failureCount < 3,
  });
}

export function useStockReportExport(date: string) {
  return useMutation({
    mutationFn: async (format: ExportFormat) => {
      const report = await getStockReport(date, new Date());
      const fileName = `laporan-stok-${date}`;

      if (format === 'csv') {
        downloadTextFile(`${fileName}.csv`, buildStockReportCsv(report), 'text/csv;charset=utf-8');
        return;
      }
      downloadBlob(`${fileName}.xlsx`, await buildStockReportXlsx(report));
    },
  });
}
