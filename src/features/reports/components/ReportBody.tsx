import type { ReactNode } from 'react';

import { formatDateTime } from '../../../utils/format-date-time';

type ReportBodyProps = {
  // Kalimat pembuka di atas isi laporan, misalnya periode atau tanggal posisi stok.
  intro: string;
  children: ReactNode;
};

// Keterangan "Dicetak pada" di bawah isi laporan hanya tampil saat dicetak.
export function ReportBody({ intro, children }: ReportBodyProps) {
  return (
    <div className="space-y-6">
      <p>{intro}</p>
      {children}
      <p className="hidden text-sm print:block">Dicetak pada {formatDateTime(new Date().toISOString())}</p>
    </div>
  );
}
