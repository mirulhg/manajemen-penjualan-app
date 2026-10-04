import { describe, expect, it } from 'vitest';

import { clipRangeToToday, parsePeriodParams, previousPeriod, resolvePeriodRange } from './date-period';

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

describe('12 bulan', () => {
  it('hari ini + 11 bulan kalender sebelumnya, mulai tanggal 1', () => {
    const { start, end } = resolvePeriodRange({ period: '12-bulan', from: null, to: null }, new Date(2026, 9, 3, 14, 0));
    expect([start, end]).toEqual([new Date(2025, 10, 1), new Date(2026, 9, 4)]);
  });
});

describe('clipRangeToToday', () => {
  it('Bulan ini dipotong sampai hari ini, rentang di masa depan menjadi kosong', () => {
    const now = new Date(2026, 9, 3, 10, 0);
    const month = resolvePeriodRange({ period: 'bulan-ini', from: null, to: null }, now);
    expect(clipRangeToToday(month, now)).toEqual({ start: new Date(2026, 9, 1), end: new Date(2026, 9, 4) });

    const future = { start: new Date(2026, 10, 5), end: new Date(2026, 10, 8) };
    const clipped = clipRangeToToday(future, now);
    expect(clipped.end).toEqual(clipped.start);
  });
});

describe('previousPeriod', () => {
  const NOW = new Date(2026, 9, 3, 10, 0);
  const current = (period: Parameters<typeof previousPeriod>[0]) =>
    clipRangeToToday(resolvePeriodRange({ period, from: null, to: null }, NOW), NOW);

  it('7 hari: 7 hari tepat sebelumnya', () => {
    expect(previousPeriod('7-hari', current('7-hari'))).toEqual({
      start: new Date(2026, 8, 20),
      end: new Date(2026, 8, 27),
    });
  });

  it('30 hari: 30 hari tepat sebelumnya', () => {
    expect(previousPeriod('30-hari', current('30-hari'))).toEqual({
      start: new Date(2026, 7, 5),
      end: new Date(2026, 8, 4),
    });
  });

  it('Bulan ini pada 31 Maret: 1 Februari sampai akhir Februari (28 hari, dipotong)', () => {
    const now = new Date(2026, 2, 31, 9, 0);
    const range = clipRangeToToday(resolvePeriodRange({ period: 'bulan-ini', from: null, to: null }, now), now);
    expect(previousPeriod('bulan-ini', range)).toEqual({ start: new Date(2026, 1, 1), end: new Date(2026, 2, 1) });
  });

  it('Bulan ini pada 31 Maret tahun kabisat: Februari berakhir 29', () => {
    const now = new Date(2028, 2, 31, 9, 0);
    const range = clipRangeToToday(resolvePeriodRange({ period: 'bulan-ini', from: null, to: null }, now), now);
    expect(previousPeriod('bulan-ini', range)).toEqual({ start: new Date(2028, 1, 1), end: new Date(2028, 2, 1) });
  });

  it('Bulan ini pada tanggal 3: tanggal 1-3 bulan lalu', () => {
    expect(previousPeriod('bulan-ini', current('bulan-ini'))).toEqual({
      start: new Date(2026, 8, 1),
      end: new Date(2026, 8, 4),
    });
  });

  it('rentang kustom: sama panjang tepat sebelum rentang', () => {
    const range = { start: new Date(2026, 9, 1), end: new Date(2026, 9, 4) };
    expect(previousPeriod('rentang', range)).toEqual({ start: new Date(2026, 8, 28), end: new Date(2026, 9, 1) });
  });

  it('12 bulan: 12 bulan kalender sebelumnya', () => {
    expect(previousPeriod('12-bulan', current('12-bulan'))).toEqual({
      start: new Date(2024, 10, 1),
      end: new Date(2025, 10, 1),
    });
  });
});
