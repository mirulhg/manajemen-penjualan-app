import type { Period } from '../../utils/date-period';

// Mengikuti previousPeriod(): pembanding "Bulan ini" adalah tanggal yang sama bulan lalu, bukan satu bulan penuh.
const COMPARISON_TEXTS: Record<Period, string> = {
  'hari-ini': 'Hari ini dibanding kemarin',
  kemarin: 'Kemarin dibanding sehari sebelumnya',
  '7-hari': '7 hari terakhir dibanding 7 hari sebelumnya',
  '30-hari': '30 hari terakhir dibanding 30 hari sebelumnya',
  'bulan-ini': 'Bulan ini dibanding tanggal yang sama bulan lalu',
  'bulan-lalu': 'Bulan lalu dibanding bulan sebelumnya',
  '12-bulan': '12 bulan terakhir dibanding 12 bulan sebelumnya',
  rentang: 'Rentang dipilih dibanding rentang sama panjang sebelumnya',
};

export function describePeriodComparison(period: Period): string {
  return COMPARISON_TEXTS[period];
}
