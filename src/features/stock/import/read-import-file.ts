import { parseCsv } from '../../../utils/parse-csv';
import { ImportError, MAX_IMPORT_FILE_BYTES, MAX_IMPORT_ROWS } from './import-error';

// Angka Excel memakai koma desimal seperti ketikan pengguna, jadi "12.5" tidak salah terbaca sebagai 125 (pemisah ribuan).
// Tipe library menulis sel tanggal sebagai `typeof Date`, padahal nilainya objek Date; dipersempit lewat unknown.
function cellToText(cell: unknown): string {
  if (cell === null || cell === undefined) return '';
  if (typeof cell === 'number') return String(cell).replace('.', ',');
  if (cell instanceof Date) return cell.toISOString();
  return typeof cell === 'string' || typeof cell === 'boolean' ? String(cell) : '';
}

async function readExcelTable(file: File): Promise<string[][]> {
  // Dimuat hanya saat file Excel dipilih, supaya library ini tidak masuk bundle utama.
  const { readSheet } = await import('read-excel-file/browser');
  const sheet = await readSheet(file);
  return sheet.map((row) => row.map(cellToText));
}

export async function readImportFile(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase();
  const isCsv = name.endsWith('.csv');
  if (!isCsv && !name.endsWith('.xlsx')) throw new ImportError('UNSUPPORTED_FILE');
  if (file.size > MAX_IMPORT_FILE_BYTES) throw new ImportError('FILE_TOO_LARGE');

  const table = isCsv ? parseCsv(await file.text()) : await readExcelTable(file);
  if (table.length - 1 > MAX_IMPORT_ROWS) throw new ImportError('TOO_MANY_ROWS');
  return table;
}
