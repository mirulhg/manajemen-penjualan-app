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

// Untuk perbandingan periode: "turun 40,3% dibanding periode sebelumnya".
export function describePeriodChange(current: number, previous: number): string {
  const change = describeChange(current, previous, 'baru ada di periode ini');
  if (/^(naik|turun) \d/.test(change)) return `${change} dibanding periode sebelumnya`;
  return change === 'sama' ? 'sama dengan periode sebelumnya' : change;
}
