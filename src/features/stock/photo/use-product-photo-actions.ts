import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CompressedPhoto } from './compress-photo';
import { productPhotoKey, removeProductPhoto, saveProductPhoto } from './product-photo-store';

export function useSaveProductPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, photo }: { productId: string; photo: CompressedPhoto }) =>
      saveProductPhoto(productId, photo),
    onSettled: (_data, _error, { productId }) =>
      queryClient.invalidateQueries({ queryKey: productPhotoKey(productId) }),
  });
}

export function useRemoveProductPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => removeProductPhoto(productId),
    onSettled: (_data, _error, productId) =>
      queryClient.invalidateQueries({ queryKey: productPhotoKey(productId) }),
  });
}
