import { db } from '../../../lib/db/database';
import { saleSchema } from '../../../lib/db/records';
import type { Sale } from '../../../lib/db/records';
import { clampPage, DEFAULT_PAGE_SIZE } from '../../../utils/pagination';
import { resolveDateRange } from '../sale-filters';
import type { SaleFilters } from '../sale-filters';
import { netRevenue } from '../sale-status';

export const SALES_QUERY_KEY = ['sales'] as const;

export type SalesPage = {
  items: Sale[];
  total: number;
  page: number;
  pageCount: number;
  // Untuk SELURUH hasil filter, bukan hanya halaman ini. count tidak menghitung transaksi yang dibatalkan.
  summary: { count: number; netRevenue: number };
};

export function salesListKey(filters: SaleFilters) {
  return [...SALES_QUERY_KEY, 'list', filters] as const;
}

export async function getSales(filters: SaleFilters, now = new Date()): Promise<SalesPage> {
  const { start, end } = resolveDateRange(filters, now);
  const rows = await db.sales
    .where('createdAt')
    .between(start.toISOString(), end.toISOString(), true, false)
    .toArray();

  const matched = saleSchema
    .array()
    .parse(rows)
    .filter((sale) => filters.method === null || sale.paymentMethod === filters.method)
    .filter((sale) => filters.actor === null || sale.actor === filters.actor)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.number.localeCompare(a.number));

  const pageCount = Math.max(1, Math.ceil(matched.length / DEFAULT_PAGE_SIZE));
  const page = clampPage(filters.page, pageCount);
  return {
    items: matched.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE),
    total: matched.length,
    page,
    pageCount,
    summary: {
      count: matched.filter((sale) => sale.status !== 'dibatalkan').length,
      netRevenue: netRevenue(matched),
    },
  };
}
