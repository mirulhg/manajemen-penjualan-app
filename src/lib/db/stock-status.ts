export type StockStatus = 'aman' | 'menipis' | 'habis';

// minStock = batas barang itu sendiri (null = pakai batas default toko, dari pengaturan).
export function getStockStatus(quantity: number, minStock: number | null, defaultMinStock: number): StockStatus {
  // Stok minus (jual melebihi stok yang diizinkan pemilik) tetap dianggap habis.
  if (quantity <= 0) return 'habis';
  const threshold = minStock ?? defaultMinStock;
  return quantity <= threshold ? 'menipis' : 'aman';
}
