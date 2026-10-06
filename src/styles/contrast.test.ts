import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Nilai dibaca langsung dari theme.css, bukan disalin, supaya mengubah token tanpa memeriksa kontras akan membuat test ini gagal.
const css = readFileSync(new URL('./theme.css', import.meta.url), 'utf8');
const TOKENS = new Map<string, string>(
  [...css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].flatMap((match) =>
    match[1] !== undefined && match[2] !== undefined ? [[match[1], match[2]] as const] : [],
  ),
);

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const [red = 0, green = 0, blue = 0] = channels;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function ratio(foreground: string, background: string): number {
  const first = TOKENS.get(foreground);
  const second = TOKENS.get(background);
  if (!first || !second) throw new Error(`Token tidak ditemukan: ${foreground} atau ${background}`);
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

const TEXT_MIN = 4.5;
const UI_MIN = 3;

// [teks, latar]: semua pasangan yang dipakai aplikasi untuk teks.
const TEXT_PAIRS: [string, string][] = [
  ['foreground', 'background'],
  ['foreground', 'card'],
  ['card-foreground', 'card'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'card'],
  ['muted-foreground', 'secondary'],
  ['secondary-foreground', 'secondary'],
  ['primary-foreground', 'primary'],
  ['accent-foreground', 'accent'],
  // Judul kartu restock: teks oranye hanya di atas Carbon.
  ['accent', 'primary'],
  ['primary-foreground', 'destructive'],
  ['destructive', 'card'],
  ['destructive', 'background'],
  ['destructive', 'destructive-bg'],
  ['success', 'success-bg'],
  ['success', 'card'],
  ['color-status-aman-text', 'color-status-aman-bg'],
  ['color-status-menipis-text', 'color-status-menipis-bg'],
  ['color-status-habis-text', 'color-status-habis-bg'],
];

// [komponen/garis, latar]: batas isian dan garis fokus perlu ≥ 3:1.
const UI_PAIRS: [string, string][] = [
  ['input', 'card'],
  ['input', 'background'],
  ['ring', 'background'],
  ['ring', 'card'],
];

describe('kontras token warna', () => {
  it.each(TEXT_PAIRS)('teks %s di atas %s minimal 4,5:1', (foreground, background) => {
    expect(ratio(foreground, background)).toBeGreaterThanOrEqual(TEXT_MIN);
  });

  it.each(UI_PAIRS)('komponen %s terhadap %s minimal 3:1', (foreground, background) => {
    expect(ratio(foreground, background)).toBeGreaterThanOrEqual(UI_MIN);
  });

  it('pengecualian yang disepakati: chart-1 (oranye) di atas kartu hanya ±2,6:1', () => {
    // Boleh karena nilai grafik selalu tersedia juga sebagai teks (tooltip, label angka, dan tabel data).
    const chart = ratio('chart-1', 'card');
    expect(chart).toBeGreaterThanOrEqual(2.5);
    expect(chart).toBeLessThan(TEXT_MIN);
  });

  it('oranye tidak dipakai sebagai teks di latar terang: accent di atas background gagal 4,5:1', () => {
    expect(ratio('accent', 'background')).toBeLessThan(TEXT_MIN);
  });
});
