import type { NewProductInput } from '../schema';
import { mapImportHeaders } from './map-import-headers';

export type ImportRow = {
  // Nomor baris di file asli: header = 1, data mulai baris 2.
  rowNumber: number;
  fields: NewProductInput;
};

export function toImportRows(table: string[][]): ImportRow[] {
  const [headerRow = [], ...dataRows] = table;
  const columns = mapImportHeaders(headerRow);
  const rows: ImportRow[] = [];

  dataRows.forEach((cells, index) => {
    if (cells.every((cell) => cell.trim() === '')) return;
    const read = (column: number) => (column === -1 ? '' : (cells[column] ?? ''));
    rows.push({
      rowNumber: index + 2,
      fields: {
        sku: read(columns.sku),
        name: read(columns.name),
        category: read(columns.category),
        unit: read(columns.unit),
        initialStock: read(columns.initialStock),
        minStock: read(columns.minStock),
        purchasePrice: read(columns.purchasePrice),
        sellingPrice: read(columns.sellingPrice),
      },
    });
  });
  return rows;
}
