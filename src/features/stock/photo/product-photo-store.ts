import { db } from '../../../lib/db/database';
import { productPhotoSchema } from '../../../lib/db/records';
import type { ProductPhoto } from '../../../lib/db/records';
import { PhotoError } from './compress-photo';
import type { CompressedPhoto } from './compress-photo';

export function productPhotoKey(productId: string) {
  return ['product-photo', productId] as const;
}

export async function saveProductPhoto(productId: string, photo: CompressedPhoto): Promise<void> {
  await db.transaction('rw', db.products, db.productPhotos, async () => {
    if (!(await db.products.get(productId))) throw new PhotoError('PRODUCT_NOT_FOUND');
    await db.productPhotos.put(
      productPhotoSchema.parse({ productId, ...photo, updatedAt: new Date().toISOString() }),
    );
  });
}

export async function removeProductPhoto(productId: string): Promise<void> {
  await db.productPhotos.delete(productId);
}

export async function getProductPhoto(productId: string): Promise<ProductPhoto | null> {
  const row = await db.productPhotos.get(productId);
  return row ? productPhotoSchema.parse(row) : null;
}
