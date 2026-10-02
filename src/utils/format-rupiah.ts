const rupiahFormat = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

// Intl menyisipkan spasi non-pemisah setelah "Rp"; diganti spasi biasa agar teks mudah dicari dan disalin.
export function formatRupiah(value: number): string {
  return rupiahFormat.format(value).replace(/\s/g, ' ');
}
