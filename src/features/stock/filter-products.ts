import type { StockFilters } from './parse-filter-params';
import type { Product } from './schema';
import { getStockStatus } from './stock-status';

const compareId = (a: string, b: string) => a.localeCompare(b, 'id');

export function filterProducts(products: Product[], filters: StockFilters): Product[] {
  const needle = filters.query?.trim().toLowerCase() ?? '';

  return products
    .filter((product) => {
      const matchesQuery =
        needle === '' ||
        product.name.toLowerCase().includes(needle) ||
        product.sku.toLowerCase().includes(needle);
      const matchesCategory = filters.category === null || product.category === filters.category;
      const matchesStatus =
        filters.status === null ||
        getStockStatus(product.stockQuantity, product.minStock) === filters.status;
      return matchesQuery && matchesCategory && matchesStatus;
    })
    .sort((a, b) => compareId(a.name, b.name));
}

export function getCategories(products: Product[]): string[] {
  return [...new Set(products.map((product) => product.category))].sort(compareId);
}

// Kategori dari URL bisa saja tidak ada di data; anggap "Semua" agar dropdown dan daftar tetap konsisten.
export function normalizeFilters(filters: StockFilters, categories: string[]): StockFilters {
  if (filters.category === null || categories.includes(filters.category)) return filters;
  return { ...filters, category: null };
}
