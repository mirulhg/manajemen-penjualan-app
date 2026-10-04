import { db } from '../../../lib/db/database';
import { syncStockAlerts } from '../../../lib/db/stock-alerts';
import { STOCK_MOVEMENT_COUNTER } from '../../../lib/db/records';
import { nextSequences } from '../../../lib/db/sequence';
import { getCurrentActor } from '../../../lib/db/settings';
import { buildProductRecords } from '../build-product-records';
import { matchExistingSpelling } from '../match-existing-spelling';
import { resolveCategory } from '../resolve-category';
import type { ReadyImportRow, SkippedImportRow } from './validate-import-rows';

export type ImportProductsResult = {
  imported: number;
  skipped: SkippedImportRow[];
};

// Semua baris masuk dalam satu transaksi: gagal di tengah berarti tidak ada barang, pergerakan, atau nomor urut yang tersimpan.
export async function importProducts(rows: ReadyImportRow[]): Promise<ImportProductsResult> {
  return db.transaction(
    'rw',
    [db.products, db.stockMovements, db.counters, db.categories, db.settings, db.stockAlerts],
    async () => {
      // SKU diperiksa ulang di sini: toko bisa berubah sejak pratinjau (mis. barang ditambah di tab lain).
      const existing = await db.products.toArray();
      const existingBySku = new Map(existing.map((product) => [product.sku, product.name]));
      const skipped: SkippedImportRow[] = [];
      const toAdd: ReadyImportRow[] = [];
      for (const row of rows) {
        const existingName = existingBySku.get(row.product.sku);
        if (existingName === undefined) toAdd.push(row);
        else skipped.push({ rowNumber: row.rowNumber, sku: row.product.sku, productName: existingName });
      }
      if (toAdd.length === 0) return { imported: 0, skipped };

      const now = new Date().toISOString();
      const actor = await getCurrentActor();
      const firstSeq = await nextSequences(STOCK_MOVEMENT_COUNTER, toAdd.length);
      const units = [...new Set(existing.map((product) => product.unit))];
      const records = [];
      for (const [index, { product }] of toAdd.entries()) {
        const unit = matchExistingSpelling(units, product.unit);
        if (!units.includes(unit)) units.push(unit);
        records.push(
          buildProductRecords(
            {
              sku: product.sku,
              name: product.name,
              category: await resolveCategory(product.category, now),
              unit,
              stockQuantity: product.initialStock,
              minStock: product.minStock,
              purchasePrice: product.purchasePrice,
              sellingPrice: product.sellingPrice,
            },
            now,
            firstSeq + index,
            actor,
          ),
        );
      }

      await db.products.bulkAdd(records.map((record) => record.product));
      await db.stockMovements.bulkAdd(records.map((record) => record.movement));
      await syncStockAlerts(records.map((record) => record.product.id), now);
      return { imported: toAdd.length, skipped };
    },
  );
}
