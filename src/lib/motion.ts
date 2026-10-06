// Nilai gerak JS. Cermin token di styles/theme.css (--ease-out, --duration-*); ubah keduanya bersamaan.
// Motion menerima detik, bukan milidetik.
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export const DURATION = {
  fast: 0.15,
  base: 0.2,
  slow: 0.3,
} as const;
