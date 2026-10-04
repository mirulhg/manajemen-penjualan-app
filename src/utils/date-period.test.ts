import { describe, expect, it } from 'vitest';

import { parsePeriodParams, resolvePeriodRange } from './date-period';

describe('resolvePeriodRange', () => {
  const range = (period: Parameters<typeof resolvePeriodRange>[0]['period'], now: Date) => {
    const { start, end } = resolvePeriodRange({ period, from: null, to: null }, now);
    return [start, end];
  };

  it('30 hari = hari ini + 29 hari sebelumnya', () => {
    expect(range('30-hari', new Date(2026, 9, 3, 14, 30))).toEqual([
      new Date(2026, 8, 4),
      new Date(2026, 9, 4),
    ]);
  });

  it('30 hari melewati batas bulan dan tahun', () => {
    expect(range('30-hari', new Date(2026, 0, 10))).toEqual([new Date(2025, 11, 12), new Date(2026, 0, 11)]);
    expect(range('30-hari', new Date(2026, 2, 1))).toEqual([new Date(2026, 0, 31), new Date(2026, 2, 2)]);
  });
});

describe('parsePeriodParams', () => {
  it('periode di luar daftar yang diizinkan kembali ke hari ini', () => {
    const params = new URLSearchParams('periode=kemarin');
    expect(parsePeriodParams(params, ['hari-ini', '7-hari']).period).toBe('hari-ini');
    expect(parsePeriodParams(params).period).toBe('kemarin');
  });
});
