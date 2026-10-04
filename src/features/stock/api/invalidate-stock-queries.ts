import type { QueryClient } from '@tanstack/react-query';

import { PRODUCT_ANALYTICS_QUERY_KEY } from '../../../lib/db/product-analytics';
import { REVENUE_BY_CATEGORY_QUERY_KEY } from '../../../lib/db/sales-analytics';
import { STOCK_MOVEMENTS_ROOT_KEY } from './get-stock-movements';
import { PRODUCTS_QUERY_KEY } from './get-products';

// Data barang berubah (tambah, ubah, arsip, impor, stok, kategori): daftar produk, analisis produk (lambat laku, perkiraan
// habis, peringkat), dan omzet per kategori jadi basi. Satu-satunya tempat yang tahu key-key itu berpasangan.
export function invalidateProductData(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: PRODUCT_ANALYTICS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: REVENUE_BY_CATEGORY_QUERY_KEY }),
  ]);
}

// Untuk fitur lain yang mengubah stok (mis. penjualan): data barang dan semua riwayat pergerakan jadi basi.
export function invalidateStockQueries(queryClient: QueryClient) {
  return Promise.all([
    invalidateProductData(queryClient),
    queryClient.invalidateQueries({ queryKey: STOCK_MOVEMENTS_ROOT_KEY }),
  ]);
}
