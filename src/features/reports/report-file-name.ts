import { startOfDay, toLocalDateText } from '../../utils/date-period';
import type { DateRange } from '../../utils/date-period';

// Tanggal awal dan akhir sama-sama inklusif; rentang kosong ditulis sebagai satu hari.
export function buildReportFileName(prefix: string, range: DateRange): string {
  const from = toLocalDateText(range.start);
  const to = toLocalDateText(range.end > range.start ? startOfDay(range.end, -1) : range.start);
  return `${prefix}-${from}_${to}`;
}
