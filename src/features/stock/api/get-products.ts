import { z } from 'zod';

import { db } from '../../../lib/db';
import { productSchema } from '../schema';
import type { Product } from '../schema';

export const PRODUCTS_QUERY_KEY = ['products'] as const;

export async function getProducts(): Promise<Product[]> {
  const rows = await db.products.toArray();
  return z.array(productSchema).parse(rows);
}
