import {
  clipRangeToToday,
  previousPeriod,
  resolvePeriodRange,
  startOfDay,
  toLocalDateText,
} from '../../utils/date-period';
import type { DateRange, PeriodSelection } from '../../utils/date-period';

// Rentang periode terpilih (dipotong sampai hari ini) beserta pembandingnya, dipakai kartu angka dan semua grafik.
export function getDashboardRanges(
  selection: PeriodSelection,
  now: Date,
): { current: DateRange; previous: DateRange } {
  const current = clipRangeToToday(resolvePeriodRange(selection, now), now);
  return { current, previous: previousPeriod(selection.period, current) };
}

// Riwayat tidak punya periode 12 bulan, jadi tautannya memakai rentang tanggal yang sama persis dengan dasbor.
export function toHistorySelection(selection: PeriodSelection, now: Date): PeriodSelection {
  if (selection.period !== '12-bulan') return selection;
  const { current } = getDashboardRanges(selection, now);
  return {
    period: 'rentang',
    from: toLocalDateText(current.start),
    to: toLocalDateText(startOfDay(current.end, -1)),
  };
}
