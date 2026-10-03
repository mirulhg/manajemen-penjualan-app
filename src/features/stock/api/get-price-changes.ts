import Dexie from 'dexie';

import { db } from '../../../lib/db/database';
import { priceChangeSchema } from '../../../lib/db/records';
import type { PriceChange } from '../../../lib/db/records';
import { clampPage } from '../../../utils/pagination';

export const PRICE_CHANGES_PAGE_SIZE = 20;
export const PRICE_CHANGES_ROOT_KEY = ['price-changes'] as const;

type PriceChangePage = {
  items: PriceChange[];
  total: number;
  page: number;
  pageCount: number;
};

export function priceChangesKey(productId: string) {
  return [...PRICE_CHANGES_ROOT_KEY, productId] as const;
}

export function priceChangesPageKey(productId: string, page: number) {
  return [...priceChangesKey(productId), page] as const;
}

export async function getPriceChanges(productId: string, requestedPage: number): Promise<PriceChangePage> {
  const ofProduct = db.priceChanges
    .where('[productId+seq]')
    .between([productId, Dexie.minKey], [productId, Dexie.maxKey]);

  const total = await ofProduct.count();
  const pageCount = Math.max(1, Math.ceil(total / PRICE_CHANGES_PAGE_SIZE));
  const page = clampPage(requestedPage, pageCount);
  const rows = await ofProduct
    .reverse()
    .offset((page - 1) * PRICE_CHANGES_PAGE_SIZE)
    .limit(PRICE_CHANGES_PAGE_SIZE)
    .toArray();

  return { items: priceChangeSchema.array().parse(rows), total, page, pageCount };
}
