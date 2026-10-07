import { db } from '../../lib/db/database';

// Semua tabel yang disentuh seed dan penghapusan; satu daftar supaya keduanya selalu cocok.
export const DEMO_TABLES = [
  db.products,
  db.stockMovements,
  db.counters,
  db.categories,
  db.sales,
  db.saleItems,
  db.saleReturns,
  db.priceChanges,
  db.productPhotos,
  db.settings,
  db.dailySales,
  db.dailyProductSales,
  db.stockAlerts,
];

export const DEMO_PIN = '1234';

export class DemoDataError extends Error {
  readonly code: 'NOT_EMPTY' | 'NOT_DEMO';

  constructor(code: 'NOT_EMPTY' | 'NOT_DEMO') {
    super(
      code === 'NOT_EMPTY'
        ? 'Data contoh hanya bisa dimuat saat belum ada barang dan transaksi.'
        : 'Database ini bukan berisi data contoh, jadi tidak ada yang dihapus.',
    );
    this.name = 'DemoDataError';
    this.code = code;
  }
}
