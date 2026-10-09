// Stok minus (jual melebihi stok) tidak menjadi modal negatif: nilainya 0, sama dengan Laporan Stok dan Lambat laku.
export function getStockValue(quantity: number, purchasePrice: number): number {
  return Math.max(quantity, 0) * purchasePrice;
}
