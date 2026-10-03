export const DEFAULT_MIN_STOCK = 5;

export type StockStatus = 'aman' | 'menipis' | 'habis';

export function getStockStatus(quantity: number, minStock: number | null): StockStatus {
  // Stok minus (jual melebihi stok yang diizinkan pemilik) tetap dianggap habis.
  if (quantity <= 0) return 'habis';
  const threshold = minStock ?? DEFAULT_MIN_STOCK;
  return quantity <= threshold ? 'menipis' : 'aman';
}
