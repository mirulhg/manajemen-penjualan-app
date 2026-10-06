export type BezierPoints = readonly [number, number, number, number];

const BEZIER_PATTERN = /cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/;

// Membaca nilai token CSS seperti "cubic-bezier(0.23, 1, 0.32, 1)"; null bila bentuknya tidak dikenal.
export function parseCubicBezier(text: string): BezierPoints | null {
  const match = BEZIER_PATTERN.exec(text);
  if (!match) return null;
  const points = match.slice(1, 5).map(Number);
  const [x1, y1, x2, y2] = points;
  if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return null;
  return points.every(Number.isFinite) ? [x1, y1, x2, y2] : null;
}

function coordinate(t: number, a: number, b: number): number {
  const inverse = 1 - t;
  return 3 * inverse * inverse * t * a + 3 * inverse * t * t * b + t * t * t;
}

// Fungsi easing dari kurva cubic-bezier (sama dengan CSS): t = waktu 0..1, hasil = progres 0..1.
export function createBezierEasing([x1, y1, x2, y2]: BezierPoints): (time: number) => number {
  return (time) => {
    if (time <= 0) return 0;
    if (time >= 1) return 1;
    // x(t) naik terus untuk kurva easing yang wajar, jadi pencarian biner cukup dan selalu konvergen.
    let low = 0;
    let high = 1;
    let guess = time;
    for (let step = 0; step < 24; step += 1) {
      guess = (low + high) / 2;
      if (coordinate(guess, x1, x2) < time) low = guess;
      else high = guess;
    }
    return coordinate(guess, y1, y2);
  };
}
