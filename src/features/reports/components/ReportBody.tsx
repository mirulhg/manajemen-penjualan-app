import type { ReactNode } from 'react';

import { startOfDay, toLocalDateText } from '../../../utils/date-period';
import type { DateRange } from '../../../utils/date-period';
import { formatDateTime, formatLocalDate } from '../../../utils/format-date-time';

type ReportBodyProps = {
  range: DateRange;
  children: ReactNode;
};

// Baris periode di atas isi laporan dan keterangan "Dicetak pada" di bawahnya (hanya tampil saat dicetak).
export function ReportBody({ range, children }: ReportBodyProps) {
  const lastDay = range.end > range.start ? startOfDay(range.end, -1) : range.start;

  return (
    <div className="space-y-6">
      <p>
        Periode: {formatLocalDate(toLocalDateText(range.start))} – {formatLocalDate(toLocalDateText(lastDay))}
      </p>
      {children}
      <p className="hidden text-sm print:block">Dicetak pada {formatDateTime(new Date().toISOString())}</p>
    </div>
  );
}
