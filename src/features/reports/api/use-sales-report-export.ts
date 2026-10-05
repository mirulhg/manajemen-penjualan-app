import { useMutation } from '@tanstack/react-query';

import { downloadBlob, downloadTextFile } from '../../../utils/download-text-file';
import type { PeriodSelection } from '../../../utils/date-period';
import { buildReportFileName } from '../report-file-name';
import { buildSalesReportCsv, buildSalesReportXlsx } from '../sales-report-files';
import type { ExportFormat } from '../report-tables';
import { getSalesReport, getSalesReportRows } from './get-sales-report';
import { getReportRange } from './read-report-sales';

export function useSalesReportExport(selection: PeriodSelection) {
  return useMutation({
    mutationFn: async (format: ExportFormat) => {
      const now = new Date();
      const baseName = buildReportFileName('laporan-penjualan', getReportRange(selection, now));

      if (format === 'csv') {
        const rows = await getSalesReportRows(selection, now);
        downloadTextFile(`${baseName}.csv`, buildSalesReportCsv(rows), 'text/csv;charset=utf-8');
        return;
      }
      const [rows, report] = await Promise.all([getSalesReportRows(selection, now), getSalesReport(selection, now)]);
      downloadBlob(`${baseName}.xlsx`, await buildSalesReportXlsx(rows, report.byDay));
    },
  });
}
