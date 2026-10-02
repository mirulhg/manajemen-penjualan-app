import { expect, it } from 'vitest';

import { formatNumber } from './format-number';

it('memakai titik sebagai pemisah ribuan', () => {
  expect(formatNumber(2000)).toBe('2.000');
  expect(formatNumber(18)).toBe('18');
});
