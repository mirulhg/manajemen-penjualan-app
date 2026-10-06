// Nilai gerak JS. Cermin token di styles/theme.css (--ease-out, --duration-*); ubah keduanya bersamaan.
// Motion menerima detik, bukan milidetik.
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export const DURATION = {
  fast: 0.15,
  base: 0.2,
  slow: 0.3,
} as const;

// Indikator aktif (pil tab, latar pilihan) berpindah tanpa pantul; ±300ms.
export const INDICATOR_TRANSITION = { type: 'spring', bounce: 0, duration: DURATION.slow } as const;

// Elemen bertanda ini (grid bento) tidak masuk sebagai satu blok saat halaman dibuka; anak-anaknya yang masuk bergantian.
export const STAGGER_CHILDREN_ATTRIBUTE = 'data-stagger-children';

// Daftar pendek yang urutan atau isinya berubah (peringatan, ranking, daftar ringkas): bergeser ke tempat baru, yang hilang memudar.
const LIST_ITEM_MOTION = {
  layout: true,
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.base, ease: EASE_OUT },
} as const;

// Chip filter: mekar kecil saat muncul, mengecil saat dihapus; chip lain bergeser mengisi tempatnya.
export const CHIP_MOTION = {
  layout: true,
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: DURATION.fast, ease: EASE_OUT },
} as const;

// Layout animation hanya untuk daftar pendek yang tidak divirtualisasi (CLAUDE.md §7); daftar lebih panjang tampil tanpa gerak per baris.
const MAX_LAYOUT_ANIMATED_ITEMS = 50;

export function listItemMotion(itemCount: number) {
  return itemCount <= MAX_LAYOUT_ANIMATED_ITEMS ? LIST_ITEM_MOTION : {};
}
