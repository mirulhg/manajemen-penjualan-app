import { startOfDay } from '../../utils/date-period';
import { getProductSalesRows, sumByProduct } from './daily-product-sales';
import { getDefaultMinStock } from './settings';
import type { StockAlertLevel } from './records';
import { RESTOCK_COVERAGE_DAYS, suggestRestockQuantity } from './restock';
import { getOpenAlerts } from './stock-alerts';

export type RestockRow = {
  productId: string;
  name: string;
  unit: string;
  stockQuantity: number;
  level: StockAlertLevel;
  quantity: number;
};

// Daftar belanja: barang yang peringatannya terbuka (Habis dulu, lalu Menipis, terbaru dulu), dengan jumlah saran restock.
export async function getRestockList(now: Date): Promise<RestockRow[]> {
  const open = await getOpenAlerts();
  if (open.length === 0) return [];

  const window = { start: startOfDay(now, -(RESTOCK_COVERAGE_DAYS - 1)), end: startOfDay(now, 1) };
  const sold = new Map(sumByProduct(await getProductSalesRows(window)).map((entry) => [entry.productId, entry.quantity]));
  const defaultMinStock = await getDefaultMinStock();

  return open.map(({ alert, product }) => ({
    productId: product.id,
    name: product.name,
    unit: product.unit,
    stockQuantity: product.stockQuantity,
    level: alert.level,
    quantity: suggestRestockQuantity({
      stock: product.stockQuantity,
      minStock: product.minStock,
      defaultMinStock,
      soldLast14Days: sold.get(product.id) ?? 0,
    }),
  }));
}
