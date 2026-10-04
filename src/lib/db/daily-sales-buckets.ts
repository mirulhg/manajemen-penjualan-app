import { startOfDay, toLocalDateText } from '../../utils/date-period';
import type { DateRange } from '../../utils/date-period';
import { toMetrics } from './daily-sales-rows';
import type { SalesMetrics } from './daily-sales-rows';
import type { DailySales } from './records';

export type Granularity = 'harian' | 'mingguan' | 'bulanan';

export type SalesBucket = {
  // label lengkap untuk tooltip dan tabel; shortLabel untuk sumbu.
  label: string;
  shortLabel: string;
  // Tanggal lokal YYYY-MM-DD, keduanya inklusif.
  startDate: string;
  endDate: string;
  metrics: SalesMetrics;
};

const DAILY_MAX_DAYS = 31;
const WEEKLY_MAX_DAYS = 182;

const dayMonth = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });
const monthYear = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' });
const monthOnly = new Intl.DateTimeFormat('id-ID', { month: 'short' });

export function defaultGranularity(range: DateRange): Granularity {
  const days = Math.round((range.end.getTime() - range.start.getTime()) / 86_400_000);
  if (days <= DAILY_MAX_DAYS) return 'harian';
  return days <= WEEKLY_MAX_DAYS ? 'mingguan' : 'bulanan';
}

// Minggu dimulai Senin.
function nextBucketBoundary(cursor: Date, granularity: Granularity): Date {
  if (granularity === 'harian') return startOfDay(cursor, 1);
  if (granularity === 'bulanan') return new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  const daysSinceMonday = (cursor.getDay() + 6) % 7;
  return startOfDay(cursor, 7 - daysSinceMonday);
}

function describeBucket(start: Date, lastDay: Date, granularity: Granularity) {
  if (granularity === 'harian') {
    return { label: dayMonth.format(start), shortLabel: dayMonth.format(start) };
  }
  if (granularity === 'bulanan') {
    return { label: monthYear.format(start), shortLabel: monthOnly.format(start) };
  }
  return {
    label: `${dayMonth.format(start)} – ${dayMonth.format(lastDay)}`,
    shortLabel: dayMonth.format(start),
  };
}

// Hari tanpa baris tetap menjadi bucket bernilai 0, supaya garis turun ke 0 dan tidak melompati hari kosong.
// Bucket pertama dan terakhir boleh terpotong oleh rentang.
export function bucketDailySales(rows: DailySales[], range: DateRange, granularity: Granularity): SalesBucket[] {
  const byDate = new Map(rows.map((row) => [row.date, row]));
  const buckets: SalesBucket[] = [];
  let cursor = range.start;

  while (cursor < range.end) {
    const boundary = nextBucketBoundary(cursor, granularity);
    const end = boundary > range.end ? range.end : boundary;
    const lastDay = startOfDay(end, -1);

    const inBucket: DailySales[] = [];
    for (let day = cursor; day < end; day = startOfDay(day, 1)) {
      const row = byDate.get(toLocalDateText(day));
      if (row) inBucket.push(row);
    }
    buckets.push({
      ...describeBucket(cursor, lastDay, granularity),
      startDate: toLocalDateText(cursor),
      endDate: toLocalDateText(lastDay),
      metrics: toMetrics(inBucket),
    });
    cursor = end;
  }
  return buckets;
}
