import { describe, expect, it } from 'vitest';

import { getListPath } from './list-return-state';

describe('getListPath', () => {
  it('memulihkan query string daftar dari state yang valid', () => {
    expect(getListPath({ search: '?status=menipis' })).toBe('/stok?status=menipis');
  });

  it('search kosong kembali ke /stok', () => {
    expect(getListPath({ search: '' })).toBe('/stok');
  });

  it.each([null, undefined, 42, {}, { other: '?q=mi' }])(
    'state %j yang tidak valid kembali ke /stok',
    (state) => {
      expect(getListPath(state)).toBe('/stok');
    },
  );

  it('search yang tidak diawali ? ditolak', () => {
    expect(getListPath({ search: 'http://x' })).toBe('/stok');
  });
});
