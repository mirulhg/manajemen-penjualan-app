import type { SalesMetrics } from '../../lib/db/daily-sales-rows';
import { formatNumber } from '../../utils/format-number';
import { formatRupiah } from '../../utils/format-rupiah';

export type MetricDefinition = {
  key: keyof SalesMetrics;
  label: string;
  format: (value: number) => string;
};

export const METRICS: MetricDefinition[] = [
  { key: 'revenue', label: 'Omzet', format: formatRupiah },
  { key: 'transactionCount', label: 'Transaksi', format: formatNumber },
  { key: 'averageTransaction', label: 'Rata-rata transaksi', format: formatRupiah },
  { key: 'grossProfit', label: 'Laba kotor', format: formatRupiah },
];
