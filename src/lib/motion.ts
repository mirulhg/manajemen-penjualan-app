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
