import { describe, expect, it } from 'vitest';

import { parseRupiah } from './parse-rupiah';

describe('parseRupiah', () => {
  it.each([
    ['12500', 12500],
    ['12.500', 12500],
    ['1.250.000', 1250000],
    ['  9.000  ', 9000],
    ['0', 0],
  ])('"%s" menjadi %i', (text, expected) => {
    expect(parseRupiah(text)).toBe(expected);
  });

  it.each(['', '12,5', '1.2.3', '12.50', '.500', '1.2345', '-5', 'abc', '12 500'])(
    '"%s" ditolak',
    (text) => {
      expect(parseRupiah(text)).toBeNull();
    },
  );
});
