const percentFormat = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Selalu teks (bukan warna atau panah saja). Kemarin 0 tidak dibagi: dilaporkan "baru ada hari ini", bukan "Infinity%".
export function describeChange(today: number, yesterday: number, newLabel = 'baru ada hari ini'): string {
  if (today === yesterday) return 'sama';
  if (yesterday === 0) return today > 0 ? newLabel : 'turun dari nol';

  const percent = (Math.abs(today - yesterday) / Math.abs(yesterday)) * 100;
  const rounded = percentFormat.format(percent);
  if (Number(rounded.replace(',', '.')) === 0) return 'sama';
  return `${today > yesterday ? 'naik' : 'turun'} ${rounded}%`;
}

const NEW_IN_PERIOD = 'baru ada di periode ini';

export type PeriodTrend = { text: string; direction: 'up' | 'down' | 'flat' };

// Arah untuk ikon: teks tetap yang menjelaskan, ikon hanya pelengkap. Bukan merah/hijau karena turun belum tentu buruk.
export function describePeriodTrend(current: number, previous: number): PeriodTrend {
  const text = describeChange(current, previous, NEW_IN_PERIOD);
  if (text.startsWith('naik') || text === NEW_IN_PERIOD) return { text, direction: 'up' };
  if (text.startsWith('turun')) return { text, direction: 'down' };
  return { text, direction: 'flat' };
}
