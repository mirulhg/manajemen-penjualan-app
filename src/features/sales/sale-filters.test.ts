import { describe, expect, it } from 'vitest';

import { parseSaleFilters, resolveDateRange, serializeSaleFilters } from './sale-filters';
import type { SaleFilters } from './sale-filters';

const NOW = new Date(2026, 9, 3, 14, 30);

function filters(query: string): SaleFilters {
  return parseSaleFilters(new URLSearchParams(query));
}

describe('parseSaleFilters', () => {
  it('bawaan: hari ini, tanpa filter lain, halaman 1', () => {
    expect(filters('')).toEqual({
      period: 'hari-ini',
      from: null,
      to: null,
      method: null,
      actor: null,
      page: 1,
    });
  });

  it('nilai tidak valid kembali ke bawaan', () => {
    expect(filters('periode=ngawur&metode=cek&halaman=abc')).toMatchObject({
      period: 'hari-ini',
      method: null,
      page: 1,
    });
  });

  it('rentang tanpa kedua tanggal valid dan berurutan kembali ke hari ini', () => {
    expect(filters('periode=rentang').period).toBe('hari-ini');
    expect(filters('periode=rentang&dari=2026-10-05&sampai=2026-10-01').period).toBe('hari-ini');
    expect(filters('periode=rentang&dari=2026-02-31&sampai=2026-03-01').period).toBe('hari-ini');
    expect(filters('periode=rentang&dari=2026-10-01&sampai=2026-10-03').period).toBe('rentang');
  });

  it('bawaan tidak ditulis ke URL', () => {
    expect(serializeSaleFilters(filters('')).toString()).toBe('');
    expect(serializeSaleFilters(filters('periode=kemarin&metode=qris&halaman=2')).toString()).toBe(
      'periode=kemarin&metode=qris&halaman=2',
    );
  });
});

describe('resolveDateRange', () => {
  const range = (query: string) => {
    const { start, end } = resolveDateRange(filters(query), NOW);
    return [start, end];
  };

  it('hari ini dan kemarin memakai tanggal lokal', () => {
    expect(range('')).toEqual([new Date(2026, 9, 3), new Date(2026, 9, 4)]);
    expect(range('periode=kemarin')).toEqual([new Date(2026, 9, 2), new Date(2026, 9, 3)]);
  });

  it('7 hari terakhir mencakup hari ini', () => {
    expect(range('periode=7-hari')).toEqual([new Date(2026, 8, 27), new Date(2026, 9, 4)]);
  });

  it('bulan ini dari tanggal 1 sampai awal bulan depan', () => {
    expect(range('periode=bulan-ini')).toEqual([new Date(2026, 9, 1), new Date(2026, 10, 1)]);
  });

  it('rentang sendiri inklusif sampai akhir hari terakhir', () => {
    expect(range('periode=rentang&dari=2026-10-01&sampai=2026-10-03')).toEqual([
      new Date(2026, 9, 1),
      new Date(2026, 9, 4),
    ]);
  });
});
