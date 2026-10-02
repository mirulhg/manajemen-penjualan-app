import { SEED_PRODUCTS } from '../features/stock/seed-data';
import type { Product } from '../features/stock/schema';

const FIXTURE_TIMESTAMP = '2026-10-02T00:00:00.000Z';

// 30 produk contoh sebagai Product lengkap (tanpa database), untuk test fungsi murni.
export const SEED_AS_PRODUCTS: Product[] = SEED_PRODUCTS.map((seed, index) => ({
  ...seed,
  id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
  createdAt: FIXTURE_TIMESTAMP,
  updatedAt: FIXTURE_TIMESTAMP,
}));
