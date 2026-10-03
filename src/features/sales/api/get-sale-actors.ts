import { db } from '../../../lib/db/database';
import { SALES_QUERY_KEY } from './get-sales';

export const SALE_ACTORS_KEY = [...SALES_QUERY_KEY, 'actors'] as const;

export async function getSaleActors(): Promise<string[]> {
  const actors = await db.sales.orderBy('actor').uniqueKeys();
  return actors.filter((actor): actor is string => typeof actor === 'string');
}
