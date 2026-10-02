import type { NewProductFields } from './build-product-records';
import { SEED_PRODUCTS } from './seed-data';

const CATEGORIES = [...new Set(SEED_PRODUCTS.map((product) => product.category))];
// Stok 0, 3, 10, 40 dipadukan dengan batas 10 atau default (null) agar ketiga status muncul.
const STOCK_CYCLE = [0, 3, 10, 40];

// Deterministik (tanpa random) supaya data uji sama di setiap perangkat dan setiap kali dibuat ulang.
export function generateExtraProducts(count: number): NewProductFields[] {
  return Array.from({ length: count }, (_, offset) => {
    const number = offset + 1;
    const label = String(number).padStart(4, '0');
    const purchasePrice = 5000 + (number % 20) * 500;

    return {
      sku: `GEN-${label}`,
      name: `Barang Uji ${label}`,
      category: CATEGORIES[number % CATEGORIES.length] ?? 'Sembako',
      unit: 'pcs',
      stockQuantity: STOCK_CYCLE[number % STOCK_CYCLE.length] ?? 0,
      minStock: number % 3 === 0 ? 10 : null,
      purchasePrice,
      sellingPrice: purchasePrice + 1500,
    };
  });
}
