import { db } from '../../../lib/db/database';
import { productSchema } from '../../../lib/db/records';
import type { Product } from '../../../lib/db/records';

type ArchiveErrorCode = 'PRODUCT_NOT_FOUND' | 'ALREADY_ARCHIVED' | 'NOT_ARCHIVED';

const MESSAGES: Record<ArchiveErrorCode, string> = {
  PRODUCT_NOT_FOUND: 'Barang tidak ditemukan.',
  ALREADY_ARCHIVED: 'Barang ini sudah diarsipkan.',
  NOT_ARCHIVED: 'Barang ini tidak sedang diarsipkan.',
};

export class ArchiveProductError extends Error {
  readonly code: ArchiveErrorCode;

  constructor(code: ArchiveErrorCode) {
    super(MESSAGES[code]);
    this.name = 'ArchiveProductError';
    this.code = code;
  }
}

async function setArchived(productId: string, archive: boolean): Promise<Product> {
  return db.transaction('rw', db.products, async () => {
    const row = await db.products.get(productId);
    if (!row) throw new ArchiveProductError('PRODUCT_NOT_FOUND');
    const product = productSchema.parse(row);
    const isArchived = product.archivedAt !== null;
    if (archive && isArchived) throw new ArchiveProductError('ALREADY_ARCHIVED');
    if (!archive && !isArchived) throw new ArchiveProductError('NOT_ARCHIVED');

    const now = new Date().toISOString();
    const updated = productSchema.parse({ ...product, archivedAt: archive ? now : null, updatedAt: now });
    await db.products.put(updated);
    return updated;
  });
}

export function archiveProduct(productId: string): Promise<Product> {
  return setArchived(productId, true);
}

export function unarchiveProduct(productId: string): Promise<Product> {
  return setArchived(productId, false);
}
