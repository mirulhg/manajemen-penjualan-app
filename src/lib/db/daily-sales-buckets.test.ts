import { describe, expect, it } from 'vitest';

import { startOfDay, toLocalDateText } from '../../utils/date-period';
import { bucketDailySales, defaultGranularity } from './daily-sales-buckets';
import { toMetrics } from './daily-sales-rows';
import type { DailySales } from './records';

const TODAY = new Date(2026, 9, 3, 10, 0); // Sabtu

function rowsFor(days: number, endExclusive: Date): DailySales[] {
  // Setiap hari: 1 transaksi senilai (1000 x nomor hari), supaya jumlah per bucket mudah dicek.
  return Array.from({ length: days }, (_, index) => {
    const date = toLocalDateText(startOfDay(endExclusive, -(days - index)));
    return { date, transactionCount: 1, grossTotal: 1000 * (index + 1), refundedTotal: 0, cogs: 0 };
  });
}

describe('defaultGranularity', () => {
  const range = (days: number) => ({ start: new Date(2026, 0, 1), end: new Date(2026, 0, 1 + days) });

  it('≤31 hari harian, ≤182 hari mingguan, selebihnya bulanan', () => {
    expect(defaultGranularity(range(31))).toBe('harian');
    expect(defaultGranularity(range(32))).toBe('mingguan');
    expect(defaultGranularity(range(182))).toBe('mingguan');
    expect(defaultGranularity(range(183))).toBe('bulanan');
  });
});

describe('bucketDailySales', () => {
  const sevenDays = { start: startOfDay(TODAY, -6), end: startOfDay(TODAY, 1) };

  it('7 hari: 7 bucket harian, hari tanpa baris (hari ini) tetap muncul bernilai 0', () => {
    const rows = rowsFor(6, startOfDay(TODAY, 0)); // data sampai kemarin
    const buckets = bucketDailySales(rows, sevenDays, 'harian');

    expect(buckets).toHaveLength(7);
    expect(buckets.at(-1)).toMatchObject({ startDate: '2026-10-03', metrics: { revenue: 0, transactionCount: 0 } });
    expect(buckets.reduce((sum, bucket) => sum + bucket.metrics.revenue, 0)).toBe(toMetrics(rows).revenue);
  });

  it('mingguan dimulai Senin; bucket pertama dan terakhir boleh terpotong', () => {
    const range = { start: new Date(2026, 8, 4), end: new Date(2026, 9, 4) }; // Jumat 4 Sep s.d. Sabtu 3 Okt
    const rows = rowsFor(30, startOfDay(TODAY, 1));
    const buckets = bucketDailySales(rows, range, 'mingguan');

    expect(buckets[0]).toMatchObject({ startDate: '2026-09-04', endDate: '2026-09-06' });
    for (const bucket of buckets.slice(1)) {
      const [year, month, day] = bucket.startDate.split('-').map(Number);
      expect(new Date(year ?? 0, (month ?? 1) - 1, day).getDay()).toBe(1);
    }
    expect(buckets.at(-1)).toMatchObject({ startDate: '2026-09-28', endDate: '2026-10-03' });
    expect(buckets.reduce((sum, bucket) => sum + bucket.metrics.revenue, 0)).toBe(toMetrics(rows).revenue);
  });

  it('12 bulan: 12 bucket bulanan kalender yang jumlahnya = omzet 12 bulan', () => {
    const range = { start: new Date(2025, 10, 1), end: new Date(2026, 9, 4) };
    const rows = rowsFor(365, new Date(2026, 9, 4));
    const buckets = bucketDailySales(rows, range, 'bulanan');

    expect(buckets).toHaveLength(12);
    expect(buckets[0]).toMatchObject({ startDate: '2025-11-01', endDate: '2025-11-30' });
    expect(buckets.at(-1)).toMatchObject({ startDate: '2026-10-01', endDate: '2026-10-03' });
    expect(buckets.reduce((sum, bucket) => sum + bucket.metrics.revenue, 0)).toBe(
      rows.filter((row) => row.date >= '2025-11-01').reduce((sum, row) => sum + row.grossTotal, 0),
    );
  });

  it('rentang kosong tidak menghasilkan bucket', () => {
    const empty = { start: startOfDay(TODAY, 1), end: startOfDay(TODAY, 1) };
    expect(bucketDailySales([], empty, 'harian')).toEqual([]);
  });

  it('bucket 12 bulan dari 365 hari rekap selesai < 100 ms', () => {
    const range = { start: new Date(2025, 9, 5), end: new Date(2026, 9, 4) };
    const rows = rowsFor(365, new Date(2026, 9, 4));
    const startedAt = performance.now();
    bucketDailySales(rows, range, 'bulanan');
    bucketDailySales(rows, range, 'mingguan');
    bucketDailySales(rows, range, 'harian');
    expect(performance.now() - startedAt).toBeLessThan(100);
  });
});
