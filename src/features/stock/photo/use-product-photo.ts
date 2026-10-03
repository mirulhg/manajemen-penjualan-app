import { useQuery } from '@tanstack/react-query';

import { getProductPhoto, productPhotoKey } from './product-photo-store';

export function useProductPhoto(productId: string) {
  return useQuery({ queryKey: productPhotoKey(productId), queryFn: () => getProductPhoto(productId) });
}
