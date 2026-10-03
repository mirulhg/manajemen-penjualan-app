// Mencegah "Sembako" dan "sembako" menjadi dua kategori: pakai ejaan yang sudah ada bila hanya beda huruf besar/kecil.
export function matchExistingSpelling(existingValues: string[], value: string): string {
  const lowered = value.toLocaleLowerCase('id');
  return existingValues.find((existing) => existing.toLocaleLowerCase('id') === lowered) ?? value;
}
