export const PERIODS = ['hari-ini', 'kemarin', '7-hari', '30-hari', 'bulan-ini', 'rentang'] as const;
export type Period = (typeof PERIODS)[number];

export const PERIOD_LABELS: Record<Period, string> = {
  'hari-ini': 'Hari ini',
  kemarin: 'Kemarin',
  '7-hari': '7 hari terakhir',
  '30-hari': '30 hari terakhir',
  'bulan-ini': 'Bulan ini',
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
    case 'rentang': {
      const from = parseLocalDate(selection.from) ?? startOfDay(now);
      const to = parseLocalDate(selection.to) ?? from;
      return { start: from, end: startOfDay(to, 1) };
    }
  }
}

// Parameter URL ?periode=&dari=&sampai=. Nilai tidak valid kembali ke 'hari-ini'; rentang butuh dua tanggal valid dan berurutan.
export function parsePeriodParams(
  params: URLSearchParams,
  allowed: readonly Period[] = PERIODS,
): PeriodSelection {
  const from = parseLocalDate(params.get('dari')) ? params.get('dari') : null;
  const to = parseLocalDate(params.get('sampai')) ? params.get('sampai') : null;
  const requested = allowed.find((period) => period === params.get('periode')) ?? 'hari-ini';
  const isUsableRange = from !== null && to !== null && from <= to;
  return {
    period: requested === 'rentang' && !isUsableRange ? 'hari-ini' : requested,
    from,
    to,
  };
}

export function serializePeriodParams(selection: PeriodSelection, params = new URLSearchParams()) {
  if (selection.period !== 'hari-ini') params.set('periode', selection.period);
  if (selection.period === 'rentang') {
    if (selection.from) params.set('dari', selection.from);
    if (selection.to) params.set('sampai', selection.to);
  }
  return params;
}
