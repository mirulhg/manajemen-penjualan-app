import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CATEGORIES_QUERY_KEY } from '../api/get-categories';
import { PRODUCTS_QUERY_KEY } from '../api/get-products';
import { STOCK_MOVEMENTS_ROOT_KEY } from '../api/get-stock-movements';
import { importProducts } from './import-products';
import type { ReadyImportRow } from './validate-import-rows';

export function useImportProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rows: ReadyImportRow[]) => importProducts(rows),
    // Barang baru membawa kategori baru dan pergerakan stok awal.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: STOCK_MOVEMENTS_ROOT_KEY }),
      ]),
  });
}
