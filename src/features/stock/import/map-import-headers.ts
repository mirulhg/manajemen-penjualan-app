import { ImportError } from './import-error';

export const IMPORT_COLUMNS = [
  { field: 'sku', title: 'SKU', isRequired: true },
  { field: 'name', title: 'Nama', isRequired: true },
  { field: 'category', title: 'Kategori', isRequired: true },
  { field: 'unit', title: 'Satuan', isRequired: true },
  { field: 'initialStock', title: 'Stok Awal', isRequired: true },
  { field: 'minStock', title: 'Batas Minimum', isRequired: false },
  { field: 'purchasePrice', title: 'Harga Beli', isRequired: true },
  { field: 'sellingPrice', title: 'Harga Jual', isRequired: true },
] as const;

export type ImportField = (typeof IMPORT_COLUMNS)[number]['field'];
// Indeks kolom per field; -1 untuk kolom opsional yang tidak ada di file.
export type ImportColumnIndexes = Record<ImportField, number>;

function normalizeHeader(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function mapImportHeaders(headerRow: string[]): ImportColumnIndexes {
  const headers = headerRow.map(normalizeHeader);
  const missing: string[] = [];
  const indexes = { sku: -1, name: -1, category: -1, unit: -1, initialStock: -1, minStock: -1, purchasePrice: -1, sellingPrice: -1 };

  for (const column of IMPORT_COLUMNS) {
    indexes[column.field] = headers.indexOf(normalizeHeader(column.title));
    if (column.isRequired && indexes[column.field] === -1) missing.push(column.title);
  }
  if (missing.length > 0) throw new ImportError('MISSING_COLUMNS', missing);
  return indexes;
}
