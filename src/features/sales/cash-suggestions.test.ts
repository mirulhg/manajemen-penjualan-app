import { describe, expect, it } from 'vitest';

import { getCashSuggestions } from './cash-suggestions';

describe('getCashSuggestions', () => {
  it('162000: uang pas, 170000, dan 200000 (200000 kembar dibuang)', () => {
    expect(getCashSuggestions(162000)).toEqual([162000, 170000, 200000]);
  });

  it('50000: kelipatan yang sama dengan total dilewati', () => {
    expect(getCashSuggestions(50000)).toEqual([50000, 100000]);
  });

  it('total 0 atau negatif tidak punya saran', () => {
    expect(getCashSuggestions(0)).toEqual([]);
  });

  it('maksimal 3 tombol', () => {
    expect(getCashSuggestions(7500).length).toBeLessThanOrEqual(3);
  });
});
