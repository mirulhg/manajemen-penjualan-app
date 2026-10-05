import readXlsxFile from 'read-excel-file/browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../lib/db/database';
import { saleSchema } from '../../lib/db/records';
import type { Sale } from '../../lib/db/records';
import { resetDatabaseWithSeed } from '../../test/reset-database';
import { getSalesReportRows } from './api/get-sales-report';
import { buildReportFileName } from './report-file-name';
import { buildSalesReportCsv, buildSalesReportXlsx } from './sales-report-files';
import type { DailyRow, TransactionRow } from './report-columns';

const TRANSACTION: TransactionRow = {
  number: 'TRX-20261003-0001',
  date: '2026-10-03',
  time: '08:00',
  actor: 'Pemilik',
  method: 'Tunai',
  subtotal: 162_000,
  itemDiscount: 0,
  transactionDiscount: 0,
  total: 162_000,
  refunded: 74_000,
  net: 88_000,
  status: 'Retur sebagian',
};
const DAY: DailyRow = { date: '2026-10-03', transactionCount: 1, netRevenue: 88_000 };

describe('ekspor CSV', () => {
  it('satu tabel rincian dengan header, pemisah ; dan angka murni tanpa Rp atau titik ribuan', () => {
    const lines = buildSalesReportCsv([TRANSACTION]).replace('\uFEFF', '').trim().split('\r\n');

    expect(lines).toEqual([
      'Nomor;Tanggal;Jam;Kasir;Metode bayar;Subtotal;Diskon barang;Diskon transaksi;Total;Retur;Bersih;Status',
      'TRX-20261003-0001;2026-10-03;08:00;Pemilik;Tunai;162000;0;0;162000;74000;88000;Retur sebagian',
    ]);
    expect(buildSalesReportCsv([TRANSACTION])).not.toMatch(/Rp|\d\.\d{3}/);
  });
});

describe('ekspor Excel', () => {
  it('dua sheet dengan sel angka bertipe angka, bukan teks', async () => {
    const blob = await buildSalesReportXlsx([TRANSACTION], [DAY]);

    const sheets = await readXlsxFile(blob);

    expect(sheets.map((sheet) => sheet.sheet)).toEqual(['Transaksi', 'Per hari']);
    expect(sheets[0]?.data[0]?.slice(0, 3)).toEqual(['Nomor', 'Tanggal', 'Jam']);
    expect(sheets[0]?.data[1]).toEqual([
      'TRX-20261003-0001', '2026-10-03', '08:00', 'Pemilik', 'Tunai', 162_000, 0, 0, 162_000, 74_000, 88_000, 'Retur sebagian',
    ]);
    expect(sheets[1]?.data[1]).toEqual(['2026-10-03', 1, 88_000]);
  });
});

describe('nama file', () => {
  it('memakai tanggal awal dan akhir yang inklusif', () => {
    expect(buildReportFileName('laporan-penjualan', { start: new Date(2026, 8, 1), end: new Date(2026, 9, 1) })).toBe(
      'laporan-penjualan-2026-09-01_2026-09-30',
    );
  });
});

describe('kinerja ekspor', () => {
  beforeEach(resetDatabaseWithSeed);

  it('10.000 transaksi dalam satu bulan: baca rincian dan buat CSV serta xlsx kurang dari 15 detik', async () => {
    const sales: Sale[] = Array.from({ length: 10_000 }, (_, index) => {
      const day = (index % 30) + 1;
      return saleSchema.parse({
        id: crypto.randomUUID(),
        number: `TRX-202609${String(day).padStart(2, '0')}-${String(index + 1).padStart(5, '0')}`,
        paymentMethod: (['tunai', 'transfer', 'qris'] as const)[index % 3],
        subtotal: 50_000,
        itemDiscountTotal: 0,
        transactionDiscount: 0,
        total: 50_000,
        amountPaid: 50_000,
        change: 0,
        itemCount: 2,
        actor: 'Pemilik',
        createdAt: new Date(2026, 8, day, 8 + (index % 12), index % 60).toISOString(),
        status: 'selesai',
        refundedTotal: 0,
      });
    });
    await db.sales.bulkAdd(sales);
    const selection = { period: 'bulan-lalu' as const, from: null, to: null };
    const now = new Date(2026, 9, 3, 10, 0);

    const csvStart = performance.now();
    const rows = await getSalesReportRows(selection, now);
    const csv = buildSalesReportCsv(rows);
    const csvMs = performance.now() - csvStart;

    const xlsxStart = performance.now();
    await buildSalesReportXlsx(rows, []);
    const xlsxMs = performance.now() - xlsxStart;

    expect(rows).toHaveLength(10_000);
    expect(csv.split('\r\n')).toHaveLength(10_002);
    expect(csvMs).toBeLessThan(15_000);
    expect(csvMs + xlsxMs).toBeLessThan(15_000);
    // Dibaca dari keluaran test (--reporter verbose): angka kinerja untuk laporan akhir.
    process.stdout.write(`\n[kinerja ekspor 10.000 transaksi] rincian+CSV ${Math.round(csvMs)} ms, xlsx ${Math.round(xlsxMs)} ms\n`);
  });
});
