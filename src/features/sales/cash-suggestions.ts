const ROUNDING_STEPS = [10_000, 50_000, 100_000];
const MAX_SUGGESTIONS = 3;

// "Uang pas" lebih dulu, lalu pembulatan ke atas yang lebih besar dari total; nominal kembar dibuang.
export function getCashSuggestions(total: number): number[] {
  if (total <= 0) return [];
  const roundedUp = ROUNDING_STEPS.map((step) => Math.ceil(total / step) * step).filter(
    (amount) => amount > total,
  );
  return [...new Set([total, ...roundedUp])].slice(0, MAX_SUGGESTIONS);
}
