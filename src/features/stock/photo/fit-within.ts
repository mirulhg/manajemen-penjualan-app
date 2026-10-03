// Mengecilkan ukuran agar sisi terpanjang tidak melebihi `max`, tanpa mengubah rasio dan tanpa pernah memperbesar.
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}
