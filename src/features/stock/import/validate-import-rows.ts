import { newProductSchema } from '../schema';
import type { NewProduct } from '../schema';
import type { ImportRow } from './to-import-rows';

export type ReadyImportRow = { rowNumber: number; product: NewProduct };
export type SkippedImportRow = { rowNumber: number; sku: string; productName: string };
export type FailedImportRow = { rowNumber: number; sku: string; messages: string[] };

export type ImportValidation = {
  ready: ReadyImportRow[];
  skipped: SkippedImportRow[];
  failed: FailedImportRow[];
};

type ExistingProduct = { sku: string; name: string };

// Aturan per baris sama persis dengan form tambah barang; di sini hanya ditambah pemeriksaan SKU antar baris dan terhadap toko.
export function validateImportRows(rows: ImportRow[], existingProducts: ExistingProduct[]): ImportValidation {
  const existingBySku = new Map(existingProducts.map((product) => [product.sku.toUpperCase(), product.name]));
  const firstRowBySku = new Map<string, number>();
  const result: ImportValidation = { ready: [], skipped: [], failed: [] };

  for (const row of rows) {
    const parsed = newProductSchema.safeParse(row.fields);
    if (!parsed.success) {
      const messages = [...new Set(parsed.error.issues.map((issue) => issue.message))];
      result.failed.push({ rowNumber: row.rowNumber, sku: row.fields.sku.trim(), messages });
      continue;
    }

    const { sku } = parsed.data;
    const existingName = existingBySku.get(sku);
    const firstRow = firstRowBySku.get(sku);
    if (existingName !== undefined) {
      result.skipped.push({ rowNumber: row.rowNumber, sku, productName: existingName });
    } else if (firstRow !== undefined) {
      result.failed.push({ rowNumber: row.rowNumber, sku, messages: [`SKU ${sku} sudah ada di baris ${firstRow}`] });
    } else {
      firstRowBySku.set(sku, row.rowNumber);
      result.ready.push({ rowNumber: row.rowNumber, product: parsed.data });
    }
  }
  return result;
}
