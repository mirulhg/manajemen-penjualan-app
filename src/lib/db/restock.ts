export const RESTOCK_COVERAGE_DAYS = 14;

type RestockInput = {
  stock: number;
  minStock: number | null;
  defaultMinStock: number;
  // Jumlah terjual dalam RESTOCK_COVERAGE_DAYS hari terakhir (hari ini + 13 hari sebelumnya).
  soldLast14Days: number;
};

// Cukup untuk 14 hari ke depan DAN cukup mengangkat stok di atas batas menipis, dikurangi stok sekarang.
// Satu-satunya rumus saran restock; dipakai Daftar perlu restock dan Perkiraan stok habis. 0 = belum perlu.
export function suggestRestockQuantity({ stock, minStock, defaultMinStock, soldLast14Days }: RestockInput): number {
  const threshold = minStock ?? defaultMinStock;
  return Math.max(0, Math.max(Math.ceil(soldLast14Days), threshold + 1) - stock);
}

export type RestockShareItem = { name: string; quantity: number; unit: string };

const shareDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' });

// Teks biasa untuk dikirim ke supplier. Sengaja tanpa harga beli.
export function buildRestockShareText(items: RestockShareItem[], date: Date): string {
  return [
    `Daftar belanja barang - ${shareDate.format(date)}`,
    ...items.map((item) => `- ${item.name}: ${item.quantity} ${item.unit}`),
  ].join('\n');
}
