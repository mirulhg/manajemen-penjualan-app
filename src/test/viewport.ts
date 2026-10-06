// jsdom tidak punya matchMedia. Lebar default 1280px (desktop) supaya tes lama memakai tata letak lebar; tes HP memanggil setViewportWidth(390).
const REM_PX = 16;
let viewportWidth = 1280;
let isReducedMotion = true;

function matchesQuery(query: string): boolean {
  // Tes berjalan tanpa gerak supaya angka dan keadaan akhir langsung tersedia; tes gerak mengubahnya lewat setReducedMotion.
  if (/prefers-reduced-motion:\s*reduce/.test(query)) return isReducedMotion;
  const min = /\(min-width:\s*([\d.]+)(rem|px)\)/.exec(query);
  if (!min?.[1]) return false;
  const limit = Number(min[1]) * (min[2] === 'rem' ? REM_PX : 1);
  return viewportWidth >= limit;
}

export function setViewportWidth(width: number) {
  viewportWidth = width;
}

export function setReducedMotion(value: boolean) {
  isReducedMotion = value;
}

export function installMatchMedia() {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: matchesQuery(query),
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  });
}
