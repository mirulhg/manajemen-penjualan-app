import { z } from 'zod';

import { db } from '../../../lib/db/database';
import { productSchema } from '../schema';
import type { Product } from '../schema';

export function productQueryKey(productId: string) {
  return ['products', productId] as const;
}

export async function getProduct(productId: string): Promise<Product | null> {
  // Id yang bukan uuid pasti tidak ada di database, jadi tidak perlu query.
  if (!z.uuid().safeParse(productId).success) return null;

  const row = await db.products.get(productId);
  return row ? productSchema.parse(row) : null;
}
