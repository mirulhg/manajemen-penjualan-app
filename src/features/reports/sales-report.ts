import { toMetrics } from '../../lib/db/daily-sales-rows';
import type { PaymentMethod, DailySales, Sale } from '../../lib/db/records';
import { startOfDay, toLocalDateText } from '../../utils/date-period';
import type { DateRange } from '../../utils/date-period';
import { saleDisplayStatus } from '../sales';
import type { SaleDisplayStatus } from '../sales';
import type { DailyRow, TransactionRow } from './report-columns';

export const METHOD_LABELS: Record<PaymentMethod, string> = { tunai: 'Tunai', transfer: 'Transfer', qris: 'QRIS' };
const METHOD_ORDER: PaymentMethod[] = ['tunai', 'transfer', 'qris'];

const STATUS_LABELS: Record<SaleDisplayStatus, string> = {
  selesai: 'Selesai',
  'retur-sebagian': 'Retur sebagian',
  'diretur-penuh': 'Diretur penuh',
  dibatalkan: 'Dibatalkan',
};

export type MethodTotals = { method: PaymentMethod; count: number; total: number; refunds: number; net: number };

export type SalesReport = {
  summary: {
    transactionCount: number;
    grossSales: number;
    discounts: number;
    refunds: number;
    netRevenue: number;
    cancelledCount: number;
  };
  byPaymentMethod: MethodTotals[];
  byDay: DailyRow[];
};

function sumOf(sales: Sale[], pick: (sale: Sale) => number): number {
  return sales.reduce((sum, sale) => sum + pick(sale), 0);
}

// Jumlah transaksi dan omzet bersih diambil dari rekap harian (sumber yang sama dengan dasbor); sisanya dari transaksi mentah.
export function buildSalesReport(sales: Sale[], dailyRows: DailySales[], range: DateRange): SalesReport {
  const active = sales.filter((sale) => sale.status !== 'dibatalkan');
  const metrics = toMetrics(dailyRows);
  const recapByDate = new Map(dailyRows.map((row) => [row.date, row]));

  const byDay: DailyRow[] = [];
  for (let day = range.start; day < range.end; day = startOfDay(day, 1)) {
    const date = toLocalDateText(day);
    const recap = recapByDate.get(date);
    byDay.push({
      date,
      transactionCount: recap?.transactionCount ?? 0,
      netRevenue: recap ? recap.grossTotal - recap.refundedTotal : 0,
    });
  }

  return {
    summary: {
      transactionCount: metrics.transactionCount,
      grossSales: sumOf(active, (sale) => sale.subtotal),
      discounts: sumOf(active, (sale) => sale.itemDiscountTotal + sale.transactionDiscount),
      refunds: sumOf(active, (sale) => sale.refundedTotal),
      netRevenue: metrics.revenue,
      cancelledCount: sales.length - active.length,
    },
    byPaymentMethod: METHOD_ORDER.map((method) => {
      const matched = active.filter((sale) => sale.paymentMethod === method);
      const total = sumOf(matched, (sale) => sale.total);
      const refunds = sumOf(matched, (sale) => sale.refundedTotal);
      return { method, count: matched.length, total, refunds, net: total - refunds };
    }),
    byDay,
  };
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

// Urut waktu; transaksi dibatalkan ikut tampil dengan status dan nilai bersih 0.
export function buildTransactionRows(sales: Sale[]): TransactionRow[] {
  return [...sales]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.number.localeCompare(b.number))
    .map((sale) => {
      const createdAt = new Date(sale.createdAt);
      const isCancelled = sale.status === 'dibatalkan';
      return {
        number: sale.number,
        date: toLocalDateText(createdAt),
        time: `${pad(createdAt.getHours())}:${pad(createdAt.getMinutes())}`,
        actor: sale.actor,
        method: METHOD_LABELS[sale.paymentMethod],
        subtotal: sale.subtotal,
        itemDiscount: sale.itemDiscountTotal,
        transactionDiscount: sale.transactionDiscount,
        total: sale.total,
        refunded: sale.refundedTotal,
        net: isCancelled ? 0 : sale.total - sale.refundedTotal,
        status: STATUS_LABELS[saleDisplayStatus(sale)],
      };
    });
}
