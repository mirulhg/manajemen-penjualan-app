import Dexie from 'dexie';
import { z } from 'zod';

import { db } from '../../../lib/db/database';
import { clampPage, DEFAULT_PAGE_SIZE } from '../../../utils/pagination';
import { stockMovementSchema } from '../schema';
import type { StockMovement } from '../schema';

type StockMovementPage = {
  items: StockMovement[];
  total: number;
  page: number;
  pageCount: number;
};

export const STOCK_MOVEMENTS_ROOT_KEY = ['stock-movements'] as const;

export function stockMovementsKey(productId: string) {
  return [...STOCK_MOVEMENTS_ROOT_KEY, productId] as const;
}

export function stockMovementsPageKey(productId: string, page: number) {
  return [...stockMovementsKey(productId), page] as const;
}

export async function getStockMovements(
  productId: string,
  requestedPage: number,
): Promise<StockMovementPage> {
  const movementsOfProduct = db.stockMovements
    .where('[productId+seq]')
    .between([productId, Dexie.minKey], [productId, Dexie.maxKey]);

  const total = await movementsOfProduct.count();
  const pageCount = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));
  const page = clampPage(requestedPage, pageCount);

  const rows = await movementsOfProduct
    .reverse()
    .offset((page - 1) * DEFAULT_PAGE_SIZE)
    .limit(DEFAULT_PAGE_SIZE)
    .toArray();

  return { items: z.array(stockMovementSchema).parse(rows), total, page, pageCount };
}
