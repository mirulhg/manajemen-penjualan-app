import { describe, expect, it } from 'vitest';

import { formatSaleNumber, getSaleCounterName } from './sale-number';

describe('nomor transaksi', () => {
  it('memakai tanggal lokal dan urutan 4 digit', () => {
    expect(formatSaleNumber(new Date(2026, 9, 3, 10, 0), 1)).toBe('TRX-20261003-0001');
    expect(formatSaleNumber(new Date(2026, 9, 3, 23, 59), 42)).toBe('TRX-20261003-0042');
  });

  it('transaksi sesaat setelah tengah malam lokal masuk ke hari itu', () => {
    expect(getSaleCounterName(new Date(2026, 0, 1, 0, 30))).toBe('sale:20260101');
  });

  it('urutan di atas 9999 tidak dipotong', () => {
    expect(formatSaleNumber(new Date(2026, 9, 3), 12345)).toBe('TRX-20261003-12345');
  });
});
