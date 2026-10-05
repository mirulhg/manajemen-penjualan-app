export const PERIODS = ['hari-ini', 'kemarin', '7-hari', '30-hari', 'bulan-ini', 'bulan-lalu', '12-bulan', 'rentang'] as const;
export type Period = (typeof PERIODS)[number];

export const PERIOD_LABELS: Record<Period, string> = {
  'hari-ini': 'Hari ini',
  kemarin: 'Kemarin',
  '7-hari': '7 hari terakhir',
  '30-hari': '30 hari terakhir',
  'bulan-ini': 'Bulan ini',
  'bulan-lalu': 'Bulan lalu',
  '12-bulan': '12 bulan terakhir',
  rentang: 'Rentang tanggal',
};

export type PeriodSelection = {
  period: Period;
  from: string | null;
  to: string | null;
};

const DATE_TEXT = /^\d{4}-\d{2}-\d{2}$/;

// Tanggal lokal "YYYY-MM-DD" yang benar-benar ada di kalender (tidak "2026-02-31").
export function parseLocalDate(text: string | null): Date | null {
  if (text === null || !DATE_TEXT.test(text)) return null;
  const [year, month, day] = text.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) return null;
  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isRealDate ? date : null;
}

export function startOfDay(date: Date, dayOffset = 0): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayOffset);
}

export function toLocalDateText(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Rentang berdasarkan tanggal lokal perangkat: awal hari (inklusif) sampai awal hari berikutnya (eksklusif).
// "7 hari" = hari ini + 6 hari sebelumnya; "30 hari" = hari ini + 29 hari sebelumnya.
export function resolvePeriodRange(selection: PeriodSelection, now: Date): { start: Date; end: Date } {
  switch (selection.period) {
    case 'hari-ini':
      return { start: startOfDay(now), end: startOfDay(now, 1) };
    case 'kemarin':
      return { start: startOfDay(now, -1), end: startOfDay(now) };
    case '7-hari':
      return { start: startOfDay(now, -6), end: startOfDay(now, 1) };
    case '30-hari':
      return { start: startOfDay(now, -29), end: startOfDay(now, 1) };
    case 'bulan-ini':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      };
    // Tanggal 1 sampai akhir bulan lalu; Januari mundur ke Desember tahun sebelumnya.
    case 'bulan-lalu':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 1),
      };
    // Hari ini + 11 bulan kalender sebelumnya, mulai tanggal 1.
    case '12-bulan':
      return { start: new Date(now.getFullYear(), now.getMonth() - 11, 1), end: startOfDay(now, 1) };
    case 'rentang': {
      const from = parseLocalDate(selection.from) ?? startOfDay(now);
      const to = parseLocalDate(selection.to) ?? from;
      return { start: from, end: startOfDay(to, 1) };
    }
  }
}

// Parameter URL ?periode=&dari=&sampai=. Nilai tidak valid kembali ke periode bawaan (default 'hari-ini');
// rentang butuh dua tanggal valid dan berurutan.
export function parsePeriodParams(
  params: URLSearchParams,
  allowed: readonly Period[] = PERIODS,
  fallback: Period = 'hari-ini',
): PeriodSelection {
  const from = parseLocalDate(params.get('dari')) ? params.get('dari') : null;
  const to = parseLocalDate(params.get('sampai')) ? params.get('sampai') : null;
  const requested = allowed.find((period) => period === params.get('periode')) ?? fallback;
  const isUsableRange = from !== null && to !== null && from <= to;
  return {
    period: requested === 'rentang' && !isUsableRange ? fallback : requested,
    from,
    to,
  };
}

// Periode bawaan tidak ditulis ke URL; periode lain (termasuk 'hari-ini' bila bawaannya berbeda) ditulis eksplisit.
export function serializePeriodParams(
  selection: PeriodSelection,
  params = new URLSearchParams(),
  defaultPeriod: Period = 'hari-ini',
) {
  if (selection.period !== defaultPeriod) params.set('periode', selection.period);
  if (selection.period === 'rentang') {
    if (selection.from) params.set('dari', selection.from);
    if (selection.to) params.set('sampai', selection.to);
  }
  return params;
}

export type DateRange = { start: Date; end: Date };

const MS_PER_DAY = 86_400_000;

// Selisih hari kalender; dibulatkan karena hari perpindahan jam musim panas bisa 23 atau 25 jam.
export function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
}

// Data tidak ada setelah hari ini; tanpa pemotongan, "Bulan ini" akan menampilkan sisa bulan sebagai hari kosong.
export function clipRangeToToday(range: DateRange, now: Date): DateRange {
  const tomorrow = startOfDay(now, 1);
  const end = range.end > tomorrow ? tomorrow : range.end;
  return { start: range.start, end: end < range.start ? range.start : end };
}

// Pembanding: rentang sama panjang tepat sebelumnya. "Bulan ini" dibandingkan dengan tanggal yang sama bulan lalu
// (dipotong bila bulan lalu lebih pendek); "12 bulan" dengan 12 bulan kalender sebelumnya.
export function previousPeriod(period: Period, range: DateRange): DateRange {
  const { start } = range;
  if (period === 'bulan-ini') {
    const previousStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
    const sameLength = new Date(
      previousStart.getFullYear(),
      previousStart.getMonth(),
      1 + daysBetween(start, range.end),
    );
    return { start: previousStart, end: sameLength > start ? start : sameLength };
  }
  if (period === '12-bulan') {
    return { start: new Date(start.getFullYear(), start.getMonth() - 12, 1), end: start };
  }
  return { start: startOfDay(start, -daysBetween(start, range.end)), end: start };
}
