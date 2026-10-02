export const DEFAULT_MIN_STOCK = 5;

export type StockStatus = 'aman' | 'menipis' | 'habis';

export function getStockStatus(quantity: number, minStock: number | null): StockStatus {
  if (quantity === 0) return 'habis';
  const threshold = minStock ?? DEFAULT_MIN_STOCK;
  return quantity <= threshold ? 'menipis' : 'aman';
}
