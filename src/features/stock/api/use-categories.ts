import { useQuery } from '@tanstack/react-query';

import { CATEGORIES_QUERY_KEY, getCategoriesWithCounts } from './get-categories';
import type { CategoryWithCounts } from './get-categories';

export function useCategories() {
  return useQuery({ queryKey: CATEGORIES_QUERY_KEY, queryFn: getCategoriesWithCounts });
}

function toNames(categories: CategoryWithCounts[]): string[] {
  return categories.map((category) => category.name);
}

// Saran kategori di form barang dan pilihan filter daftar stok: hanya nama, termasuk kategori yang masih kosong.
export function useCategoryNames() {
  return useQuery({ queryKey: CATEGORIES_QUERY_KEY, queryFn: getCategoriesWithCounts, select: toNames });
}
