import Dexie from 'dexie';

import { db } from '../../../lib/db/database';
import { productSchema, stockMovementSchema } from '../../../lib/db/records';
import type { Product, StockMovement } from '../../../lib/db/records';

// Semua fungsi di sini dipanggil di dalam transaksi pemanggil (db.products dan db.stockMovements harus ada di scope-nya).

// Produk sudah ada sebelum batas bila dibuat sebelum batas, atau pergerakan 'awal'-nya (yang pertama menurut seq) sebelum batas.
// Data contoh bertanggal mundur memakai pergerakan awal yang lebih tua dari createdAt produk.
export async function readProductsExistingBefore(boundaryIso: string): Promise<Product[]> {
  const products = productSchema.array().parse(await db.products.toArray());
  const existing = await Promise.all(
    products.map(async (product) => {
      if (product.createdAt < boundaryIso) return true;
      const first = await db.stockMovements
        .where('[productId+seq]')
        .between([product.id, Dexie.minKey], [product.id, Dexie.maxKey])
        .first();
      return first !== undefined && first.createdAt < boundaryIso;
    }),
  );
  return products.filter((_, index) => existing[index]);
}

export async function readMovementsFrom(startIso: string): Promise<StockMovement[]> {
  return stockMovementSchema.array().parse(await db.stockMovements.where('createdAt').aboveOrEqual(startIso).toArray());
}

// Σ (sesudah - sebelum) per produk. Stok pada batas waktu = stok sekarang dikurangi nilai ini untuk pergerakan sesudah batas.
export function sumMovementDeltas(movements: StockMovement[]): Map<string, number> {
  const deltas = new Map<string, number>();
  for (const movement of movements) {
    deltas.set(movement.productId, (deltas.get(movement.productId) ?? 0) + movement.quantityAfter - movement.quantityBefore);
  }
  return deltas;
}
