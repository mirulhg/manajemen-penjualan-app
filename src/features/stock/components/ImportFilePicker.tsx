import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { downloadTextFile } from '../../../utils/download-text-file';
import { buildTemplateCsv } from '../import/import-reports';
import { readImportFile } from '../import/read-import-file';
import { toImportRows } from '../import/to-import-rows';
import type { ImportRow } from '../import/to-import-rows';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ImportFilePickerProps = {
  onRowsRead: (rows: ImportRow[]) => void;
};

export function ImportFilePicker({ onRowsRead }: ImportFilePickerProps) {
  const [error, setError] = useState<Error | null>(null);
  const [isReading, setIsReading] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsReading(true);
    try {
      onRowsRead(toImportRows(await readImportFile(file)));
    } catch (readError) {
      setError(
        readError instanceof Error
          ? readError
          : new Error('File tidak bisa dibaca. Periksa isinya, atau simpan ulang sebagai CSV.'),
      );
      // Memilih file yang sama lagi setelah diperbaiki harus tetap memicu perubahan.
      event.target.value = '';
    } finally {
      setIsReading(false);
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFileChange(event);
  }

  function handleDownloadTemplate() {
    downloadTextFile('template-impor-barang.csv', buildTemplateCsv(), 'text/csv;charset=utf-8');
  }

  return (
    <div className="space-y-4">
      <p>
        Siapkan file CSV atau Excel (.xlsx) dengan kolom SKU, Nama, Kategori, Satuan, Stok Awal, Batas Minimum
        (boleh kosong), Harga Beli, dan Harga Jual. Barang yang SKU-nya sudah ada di toko dilewati, tidak diubah.
      </p>
      <button
        type="button"
        onClick={handleDownloadTemplate}
        className="min-h-11 rounded-md border border-border bg-card px-4 font-medium"
      >
        Unduh template CSV
      </button>
      <div>
        <Label htmlFor="import-file">
          File barang
        </Label>
        <Input
          id="import-file"
          type="file"
          accept=".csv,.xlsx"
          disabled={isReading}
          onChange={handleChange}
          className="mt-1"
        />
      </div>
      {isReading && <p role="status">Membaca file…</p>}
      {error && (
        <Alert variant="destructive" className="p-3">
          {error.message}
        </Alert>
      )}
    </div>
  );
}
