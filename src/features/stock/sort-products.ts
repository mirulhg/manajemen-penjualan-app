import type { Product } from './schema';

export type StockSort = 'nama' | 'stok-sedikit' | 'stok-banyak' | 'terbaru';

const compareName = (a: Product, b: Product) => a.name.localeCompare(b.name, 'id');

// Nilai seri selalu jatuh ke nama A–Z supaya urutan konsisten antar render.
export function sortProducts(products: Product[], sort: StockSort): Product[] {
  const compareBySort = {
    nama: () => 0,
    'stok-sedikit': (a: Product, b: Product) => a.stockQuantity - b.stockQuantity,
    'stok-banyak': (a: Product, b: Product) => b.stockQuantity - a.stockQuantity,
    terbaru: (a: Product, b: Product) => b.updatedAt.localeCompare(a.updatedAt),
  }[sort];

  return [...products].sort((a, b) => compareBySort(a, b) || compareName(a, b));
}
