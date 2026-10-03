import { z } from 'zod';

import { db } from '../../../lib/db/database';
import { saleItemSchema, saleReturnSchema, saleSchema } from '../../../lib/db/records';
import { getItemProgress } from '../sale-returns';
import { SALES_QUERY_KEY } from './get-sales';

export function saleDetailKey(saleId: string) {
  return [...SALES_QUERY_KEY, 'detail', saleId] as const;
}

export async function getSaleDetail(saleId: string) {
  // Id yang bukan uuid pasti tidak ada di database, jadi tidak perlu query.
  if (!z.uuid().safeParse(saleId).success) return null;
  const row = await db.sales.get(saleId);
  if (!row) return null;

  const sale = saleSchema.parse(row);
  const items = saleItemSchema.array().parse(await db.saleItems.where('saleId').equals(saleId).toArray());
  const returns = saleReturnSchema
    .array()
    .parse(await db.saleReturns.where('saleId').equals(saleId).toArray())
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.number.localeCompare(b.number));
  return { sale, returns, progress: getItemProgress(sale, items, returns) };
}

export type SaleDetail = NonNullable<Awaited<ReturnType<typeof getSaleDetail>>>;
