import { describe, expect, it } from 'vitest';

import { getDashboardRanges, toHistorySelection } from './dashboard-range';

const NOW = new Date(2026, 9, 3, 10, 0);

describe('getDashboardRanges', () => {
  it('7 hari: periode ini dan 7 hari sebelumnya', () => {
    const { current, previous } = getDashboardRanges({ period: '7-hari', from: null, to: null }, NOW);
    expect(current).toEqual({ start: new Date(2026, 8, 27), end: new Date(2026, 9, 4) });
    expect(previous).toEqual({ start: new Date(2026, 8, 20), end: new Date(2026, 8, 27) });
  });

  it('Bulan ini dipotong sampai hari ini dan dibandingkan dengan tanggal yang sama bulan lalu', () => {
    const { current, previous } = getDashboardRanges({ period: 'bulan-ini', from: null, to: null }, NOW);
    expect(current).toEqual({ start: new Date(2026, 9, 1), end: new Date(2026, 9, 4) });
    expect(previous).toEqual({ start: new Date(2026, 8, 1), end: new Date(2026, 8, 4) });
  });
});

describe('toHistorySelection', () => {
  it('periode yang dikenal Riwayat tidak berubah', () => {
    const selection = { period: '30-hari' as const, from: null, to: null };
    expect(toHistorySelection(selection, NOW)).toEqual(selection);
  });

  it('12 bulan menjadi rentang tanggal eksplisit yang sama dengan dasbor', () => {
    expect(toHistorySelection({ period: '12-bulan', from: null, to: null }, NOW)).toEqual({
      period: 'rentang',
      from: '2025-11-01',
      to: '2026-10-03',
    });
  });
});
