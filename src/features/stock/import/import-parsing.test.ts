import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { MIXED_IMPORT_CSV, SEED_PRODUCT_REFS } from '../../../test/import-sample';
import { parseCsv } from '../../../utils/parse-csv';
import { ImportError } from './import-error';
import { buildFailedRowsCsv, buildTemplateCsv } from './import-reports';
import { mapImportHeaders } from './map-import-headers';
import { readImportFile } from './read-import-file';
import { toImportRows } from './to-import-rows';
import { validateImportRows } from './validate-import-rows';

function validateMixed() {
  return validateImportRows(toImportRows(parseCsv(MIXED_IMPORT_CSV)), SEED_PRODUCT_REFS);
}

describe('mapImportHeaders', () => {
  it('mencocokkan header tanpa memandang huruf besar/kecil dan spasi', () => {
    const indexes = mapImportHeaders(['  sku ', 'NAMA', 'kategori', 'Satuan', 'stok  awal', 'harga beli', 'Harga Jual']);
    expect(indexes).toMatchObject({ sku: 0, name: 1, initialStock: 4, purchasePrice: 5, sellingPrice: 6, minStock: -1 });
  });

  it('kolom wajib yang hilang: MISSING_COLUMNS menyebut namanya', () => {
    const header = ['SKU', 'Nama', 'Kategori', 'Satuan', 'Stok Awal', 'Harga Beli'];
    expect(() => mapImportHeaders(header)).toThrow(ImportError);
    try {
      mapImportHeaders(header);
    } catch (error) {
      expect(error).toMatchObject({ code: 'MISSING_COLUMNS', columns: ['Harga Jual'] });
      expect(error instanceof Error && error.message).toContain('Harga Jual');
    }
  });
});

describe('toImportRows', () => {
  it('nomor baris mengikuti Excel (header = 1) dan baris kosong diabaikan tanpa menggeser nomor', () => {
    const rows = toImportRows([
      ['SKU', 'Nama', 'Kategori', 'Satuan', 'Stok Awal', 'Harga Beli', 'Harga Jual'],
      ['A-1', 'Beras', 'Sembako', 'sak', '1', '1000', '2000'],
      ['', '', '', '', '', '', ''],
      ['A-2', 'Gula', 'Sembako', 'kg', '1', '1000', '2000'],
    ]);
    expect(rows.map((row) => row.rowNumber)).toEqual([2, 4]);
  });
});

describe('validateImportRows (contoh impor campur)', () => {
  it('8 siap, 1 dilewati (baris 10), 6 gagal (baris 11–16)', () => {
    const { ready, skipped, failed } = validateMixed();

    expect(ready).toHaveLength(8);
    expect(skipped).toEqual([{ rowNumber: 10, sku: 'SBK-001', productName: 'Beras Premium 5 kg' }]);
    expect(failed.map((row) => row.rowNumber)).toEqual([11, 12, 13, 14, 15, 16]);
  });

  it('pesan gagal per baris sama dengan pesan form', () => {
    const byRow = new Map(validateMixed().failed.map((row) => [row.rowNumber, row]));

    expect(byRow.get(11)).toMatchObject({ sku: 'ATK 004', messages: ['SKU hanya boleh huruf, angka, dan tanda hubung (2–32 karakter).'] });
    expect(byRow.get(12)?.messages).toEqual(['Tulis nama barang minimal 2 karakter.']);
    expect(byRow.get(13)?.messages).toEqual(['Harga harus berupa angka, misalnya 12500 atau 12.500.']);
    expect(byRow.get(14)?.messages).toEqual(['Jumlah harus bilangan bulat tanpa koma.']);
    expect(byRow.get(15)?.messages).toEqual(['SKU ATK-001 sudah ada di baris 2']);
    expect(byRow.get(16)?.messages).toEqual(['Isi nama kategori minimal 2 karakter.']);
  });
});

describe('laporan dan template', () => {
  it('laporan baris gagal: BOM, pemisah titik koma, kolom Baris;SKU;Alasan', () => {
    const lines = buildFailedRowsCsv(validateMixed().failed).split('\r\n');

    expect(lines[0]).toBe('﻿Baris;SKU;Alasan');
    expect(lines[5]).toBe('15;ATK-001;SKU ATK-001 sudah ada di baris 2');
    expect(lines).toHaveLength(8);
  });

  it('template berisi header lengkap dan 2 baris contoh yang lolos validasi', () => {
    const table = parseCsv(buildTemplateCsv());

    expect(table[0]).toEqual(['SKU', 'Nama', 'Kategori', 'Satuan', 'Stok Awal', 'Batas Minimum', 'Harga Beli', 'Harga Jual']);
    expect(validateImportRows(toImportRows(table), []).ready).toHaveLength(2);
  });
});

describe('readImportFile', () => {
  it('format selain CSV/XLSX ditolak', async () => {
    await expect(readImportFile(new File(['x'], 'daftar.pdf'))).rejects.toMatchObject({ code: 'UNSUPPORTED_FILE' });
  });

  it('file lebih dari 5 MB ditolak', async () => {
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'besar.csv');
    await expect(readImportFile(big)).rejects.toMatchObject({ code: 'FILE_TOO_LARGE' });
  });

  it('lebih dari 2.000 baris data ditolak, tepat 2.000 diterima', async () => {
    const build = (count: number) =>
      new File([`SKU;Nama\n${Array.from({ length: count }, (_, index) => `A-${index};x`).join('\n')}`], 'banyak.csv');

    await expect(readImportFile(build(2001))).rejects.toMatchObject({ code: 'TOO_MANY_ROWS' });
    expect(await readImportFile(build(2000))).toHaveLength(2001);
  });

  it('.xlsx menghasilkan validasi yang sama dengan versi CSV-nya', async () => {
    const bytes = readFileSync(new URL('../../../test/fixtures/impor-campur.xlsx', import.meta.url));
    const table = await readImportFile(new File([bytes], 'Barang.XLSX'));
    const fromExcel = validateImportRows(toImportRows(table), SEED_PRODUCT_REFS);
    const fromCsv = validateMixed();

    expect(fromExcel.ready).toEqual(fromCsv.ready);
    expect(fromExcel.skipped).toEqual(fromCsv.skipped);
    expect(fromExcel.failed.map((row) => [row.rowNumber, row.messages])).toEqual(
      fromCsv.failed.map((row) => [row.rowNumber, row.messages]),
    );
  });
});
