import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CategoryNameInput } from '../schema';
import { createCategory } from './create-category';
import { deleteCategory } from './delete-category';
import { CATEGORIES_QUERY_KEY } from './get-categories';
import { PRODUCTS_QUERY_KEY } from './get-products';
import { renameCategory } from './rename-category';

function useCategoryMutation<Variables, Result>(action: (variables: Variables) => Promise<Result>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: action,
    // Nama kategori tersimpan di setiap barang, jadi daftar barang ikut basi.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
      ]),
  });
}

export function useCreateCategory() {
  return useCategoryMutation((name: CategoryNameInput) => createCategory(name));
}

export function useRenameCategory() {
  return useCategoryMutation(({ id, name }: { id: string; name: CategoryNameInput }) => renameCategory(id, name));
}

export function useDeleteCategory() {
  return useCategoryMutation((id: string) => deleteCategory(id));
}
