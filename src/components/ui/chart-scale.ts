const STEP_MULTIPLIERS = [1, 2, 5, 10];
const TARGET_INTERVALS = 4;

// Sumbu Y selalu mulai dari 0 dengan garis kisi di bilangan bulat yang "enak dibaca" (1, 2, 5 x 10^n).
export function getYAxis(maxValue: number): { ticks: number[]; top: number } {
  if (maxValue <= 0) return { ticks: [0, 1], top: 1 };

  const rawStep = maxValue / TARGET_INTERVALS;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = Math.max(
    1,
    (STEP_MULTIPLIERS.find((multiplier) => multiplier * magnitude >= rawStep) ?? 10) * magnitude,
  );

  const top = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let tick = 0; tick <= top; tick += step) ticks.push(tick);
  return { ticks, top };
}

// Posisi titik pada sumbu X dalam persen lebar area plot; satu titik saja berada di tengah.
export function pointPercent(index: number, count: number): number {
  return count <= 1 ? 50 : (index / (count - 1)) * 100;
}

// Indeks yang paling dekat dengan posisi pointer; dipakai untuk garis (titik) dan batang vertikal (pita).
export function indexFromPointer(offsetX: number, width: number, count: number, mode: 'point' | 'band'): number {
  if (count <= 1 || width <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, offsetX / width));
  const index = mode === 'point' ? Math.round(ratio * (count - 1)) : Math.floor(ratio * count);
  return Math.min(count - 1, index);
}

// Label sumbu X ditampilkan selang-seling sebanyak muat; indeks terakhir tidak pernah dipaksa.
export function visibleLabelIndexes(count: number, maxLabels: number): number[] {
  const step = Math.max(1, Math.ceil(count / maxLabels));
  return Array.from({ length: count }, (_, index) => index).filter((index) => index % step === 0);
}
