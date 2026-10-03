export const MAX_IMPORT_ROWS = 2000;
export const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024;

type ImportErrorCode = 'MISSING_COLUMNS' | 'UNSUPPORTED_FILE' | 'FILE_TOO_LARGE' | 'TOO_MANY_ROWS';

const MESSAGES: Record<Exclude<ImportErrorCode, 'MISSING_COLUMNS'>, string> = {
  UNSUPPORTED_FILE: 'Format file tidak didukung. Simpan datanya sebagai CSV atau Excel (.xlsx), lalu pilih file itu lagi.',
  FILE_TOO_LARGE: 'Ukuran file lebih dari 5 MB. Pecah menjadi beberapa file yang lebih kecil, lalu impor satu per satu.',
  TOO_MANY_ROWS: 'File berisi lebih dari 2.000 baris barang. Pecah menjadi beberapa file, lalu impor satu per satu.',
};

export class ImportError extends Error {
  readonly code: ImportErrorCode;
  readonly columns: string[];

  constructor(code: ImportErrorCode, columns: string[] = []) {
    super(
      code === 'MISSING_COLUMNS'
        ? `Kolom ${columns.join(', ')} tidak ditemukan di baris pertama. Unduh template CSV, lalu samakan nama kolomnya.`
        : MESSAGES[code],
    );
    this.name = 'ImportError';
    this.code = code;
    this.columns = columns;
  }
}
