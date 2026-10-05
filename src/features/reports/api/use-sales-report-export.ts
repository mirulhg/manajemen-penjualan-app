import { useMutation } from '@tanstack/react-query';

import { downloadBlob, downloadTextFile } from '../../../utils/download-text-file';
import type { PeriodSelection } from '../../../utils/date-period';
import { buildSalesReportCsvFiles, buildSalesReportFileName, buildSalesReportXlsx } from '../sales-report-files';
import { getSalesReport, getSalesReportRows } from './get-sales-report';
import { getReportRange } from './read-report-sales';

export type ExportFormat = 'csv' | 'xlsx';

export function useSalesReportExport(selection: PeriodSelection) {
  return useMutation({
    mutationFn: async (format: ExportFormat) => {
      const now = new Date();
      const [rows, report] = await Promise.all([getSalesReportRows(selection, now), getSalesReport(selection, now)]);
      const baseName = buildSalesReportFileName(getReportRange(selection, now));

      if (format === 'xlsx') {
        downloadBlob(`${baseName}.xlsx`, await buildSalesReportXlsx(rows, report.byDay));
        return;
      }
      for (const file of buildSalesReportCsvFiles(rows, report.byDay, baseName)) {
        downloadTextFile(file.fileName, file.content, 'text/csv;charset=utf-8');
      }
    },
  });
}
