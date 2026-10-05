const numberFormat = new Intl.NumberFormat('id-ID');

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

// Bertanda untuk selisih: "+2", "−2" (tanda minus sungguhan, seperti pratinjau penyesuaian stok), atau "0".
export function formatSignedNumber(value: number): string {
  if (value > 0) return `+${numberFormat.format(value)}`;
  return value < 0 ? `−${numberFormat.format(-value)}` : '0';
}
