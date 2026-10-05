import { startOfDay, toLocalDateText } from '../../utils/date-period';
import type { DateRange } from '../../utils/date-period';
import { formatLocalDate } from '../../utils/format-date-time';

export function describeReportPeriod(range: DateRange): string {
  const lastDay = range.end > range.start ? startOfDay(range.end, -1) : range.start;
  return `Periode: ${formatLocalDate(toLocalDateText(range.start))} – ${formatLocalDate(toLocalDateText(lastDay))}`;
}
