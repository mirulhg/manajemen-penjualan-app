import { describe, expect, it } from 'vitest';

import { allocateLineNets } from './allocate-line-nets';
import { refundAmountFor } from './sale-returns';
import { netRevenue, saleDisplayStatus } from './sale-status';

describe('allocateLineNets', () => {
  const lines = [
    { quantity: 2, unitPrice: 74000, discount: 4000 },
    { quantity: 3, unitPrice: 3500, discount: 0 },
    { quantity: 1, unitPrice: 3500, discount: 0 },
  ];

  it('membagi diskon transaksi dengan sisa terbesar: [142177, 10367, 3456] = 156000', () => {
    const nets = allocateLineNets({ total: 156000 }, lines);
    expect(nets).toEqual([142177, 10367, 3456]);
    expect(nets.reduce((a, b) => a + b, 0)).toBe(156000);
  });

  it('tanpa diskon transaksi, nilai bersih = nilai baris setelah diskon baris', () => {
    expect(allocateLineNets({ total: 158000 }, lines)).toEqual([144000, 10500, 3500]);
  });

  it('sisa pecahan yang sama: baris lebih awal menang, jumlah tetap persis total', () => {
    const equal = [
      { quantity: 1, unitPrice: 1000, discount: 0 },
      { quantity: 1, unitPrice: 1000, discount: 0 },
      { quantity: 1, unitPrice: 1000, discount: 0 },
    ];
    expect(allocateLineNets({ total: 100 }, equal)).toEqual([34, 33, 33]);
  });

  it('transaksi bernilai nol menghasilkan nol di semua baris', () => {
    expect(allocateLineNets({ total: 0 }, [{ quantity: 1, unitPrice: 1000, discount: 1000 }])).toEqual([0]);
  });
});

describe('refundAmountFor', () => {
  it('retur 1 dari 2: floor(net × 1 / 2), lalu unit terakhir mendapat sisanya', () => {
    expect(refundAmountFor(142177, 2, 0, 0, 1)).toBe(71088);
    expect(refundAmountFor(142177, 2, 1, 71088, 1)).toBe(71089);
  });

  it('retur sekaligus semua unit = seluruh nilai bersih baris', () => {
    expect(refundAmountFor(142177, 2, 0, 0, 2)).toBe(142177);
  });

  it('beberapa retur satu per satu dari 3 unit selalu berjumlah persis nilai bersih', () => {
    const net = 10_001;
    const first = refundAmountFor(net, 3, 0, 0, 1);
    const second = refundAmountFor(net, 3, 1, first, 1);
    const third = refundAmountFor(net, 3, 2, first + second, 1);
    expect(first + second + third).toBe(net);
  });
});

describe('status dan omzet', () => {
  const base = { total: 100000 };

  it('status tampil menurut pembatalan dan total retur', () => {
    expect(saleDisplayStatus({ ...base, status: 'selesai', refundedTotal: 0 })).toBe('selesai');
    expect(saleDisplayStatus({ ...base, status: 'selesai', refundedTotal: 40000 })).toBe('retur-sebagian');
    expect(saleDisplayStatus({ ...base, status: 'selesai', refundedTotal: 100000 })).toBe('diretur-penuh');
    expect(saleDisplayStatus({ ...base, status: 'dibatalkan', refundedTotal: 40000 })).toBe('dibatalkan');
  });

  it('omzet mengabaikan transaksi dibatalkan dan mengurangi retur', () => {
    expect(
      netRevenue([
        { total: 162000, status: 'selesai', refundedTotal: 74000 },
        { total: 68000, status: 'dibatalkan', refundedTotal: 0 },
        { total: 10000, status: 'selesai', refundedTotal: 0 },
      ]),
    ).toBe(98000);
  });
});
