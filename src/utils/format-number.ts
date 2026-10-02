const numberFormat = new Intl.NumberFormat('id-ID');

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}
