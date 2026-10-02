const PLAIN_DIGITS = /^\d+$/;
const DOT_THOUSANDS = /^\d{1,3}(\.\d{3})+$/;

// Titik hanya diterima sebagai pemisah ribuan yang valid ("12.500"); "1.2.3" dan "12,5" ditolak.
export function parseRupiah(text: string): number | null {
  const value = text.trim();
  if (!PLAIN_DIGITS.test(value) && !DOT_THOUSANDS.test(value)) return null;
  return Number(value.replaceAll('.', ''));
}
