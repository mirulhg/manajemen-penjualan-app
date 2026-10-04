import { describe, expect, it } from 'vitest';

import { formatCompactRupiah } from './format-compact-rupiah';

describe('formatCompactRupiah', () => {
  it('ribuan, jutaan, dan nol', () => {
    expect(formatCompactRupiah(850_000)).toBe('Rp 850 rb');
    expect(formatCompactRupiah(1_200_000)).toBe('Rp 1,2 jt');
    expect(formatCompactRupiah(5_524_500)).toBe('Rp 5,5 jt');
    expect(formatCompactRupiah(0)).toBe('Rp 0');
    expect(formatCompactRupiah(750)).toBe('Rp 750');
  });

  it('pembulatan yang mencapai 1.000 naik ke satuan berikutnya', () => {
    expect(formatCompactRupiah(999_960)).toBe('Rp 1 jt');
    expect(formatCompactRupiah(2_000_000_000)).toBe('Rp 2 mlr');
  });

  it('nilai negatif memakai tanda minus di depan', () => {
    expect(formatCompactRupiah(-1_500)).toBe('-Rp 1,5 rb');
  });
});
