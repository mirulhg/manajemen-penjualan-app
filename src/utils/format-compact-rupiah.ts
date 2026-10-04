const compactNumber = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });

const UNITS = [
  { threshold: 1_000_000_000, suffix: 'mlr' },
  { threshold: 1_000_000, suffix: 'jt' },
  { threshold: 1_000, suffix: 'rb' },
] as const;

// Label sumbu grafik: "Rp 850 rb", "Rp 1,2 jt". Satu desimal; hasil yang membulat ke 1.000 naik ke satuan berikutnya.
export function formatCompactRupiah(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}Rp ${compact(Math.abs(value))}`;
}

function compact(abs: number): string {
  for (const { threshold, suffix } of UNITS) {
    if (abs < threshold) continue;
    const scaled = Math.round((abs / threshold) * 10) / 10;
    if (scaled >= 1000 && threshold < UNITS[0].threshold) return compact(scaled * threshold);
    return `${compactNumber.format(scaled)} ${suffix}`;
  }
  return compactNumber.format(abs);
}
