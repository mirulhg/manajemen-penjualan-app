import { expect, it } from 'vitest';

import { formatRupiah } from './format-rupiah';

it.each([
  [0, 'Rp 0'],
  [12500, 'Rp 12.500'],
  [4025100, 'Rp 4.025.100'],
])('%i menjadi "%s"', (value, expected) => {
  expect(formatRupiah(value)).toBe(expected);
});
