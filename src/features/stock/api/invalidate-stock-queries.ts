import type { QueryClient } from '@tanstack/react-query';

import { STOCK_MOVEMENTS_ROOT_KEY } from './get-stock-movements';
import { PRODUCTS_QUERY_KEY } from './get-products';

// Untuk fitur lain yang mengubah stok (mis. penjualan): daftar produk dan semua riwayat pergerakan jadi basi.
export function invalidateStockQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: STOCK_MOVEMENTS_ROOT_KEY }),
  ]);
}
