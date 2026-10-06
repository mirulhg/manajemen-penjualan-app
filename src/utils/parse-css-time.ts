// Nilai token CSS bisa berbentuk "700ms" (dev) atau ".7s" (build yang di-minify); hasilnya selalu milidetik, NaN bila bukan waktu.
export function parseCssTime(text: string): number {
  const match = /^\s*(-?[\d.]+)(ms|s)\s*$/.exec(text);
  if (!match?.[1]) return Number.NaN;
  const value = Number(match[1]);
  return match[2] === 's' ? value * 1000 : value;
}
