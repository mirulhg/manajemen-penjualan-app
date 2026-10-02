import { describe, expect, it } from 'vitest';

import { clampPage, parsePageParam } from './movement-page';

describe('parsePageParam', () => {
  it.each([null, '', '0', '-1', 'abc', '1.5', '02x'])('"%s" menjadi halaman 1', (raw) => {
    expect(parsePageParam(raw)).toBe(1);
  });

  it('bilangan bulat positif dibaca apa adanya', () => {
    expect(parsePageParam('3')).toBe(3);
  });
});

describe('clampPage', () => {
  it('halaman di dalam jangkauan dipertahankan', () => {
    expect(clampPage(3, 3)).toBe(3);
  });

  it('halaman di luar jangkauan (999) kembali ke 1', () => {
    expect(clampPage(999, 3)).toBe(1);
  });
});
