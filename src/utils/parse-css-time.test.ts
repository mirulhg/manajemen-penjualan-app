import { describe, expect, it } from 'vitest';

import { parseCssTime } from './parse-css-time';

describe('parseCssTime', () => {
  it('milidetik dan detik menghasilkan milidetik yang sama, termasuk bentuk hasil minify', () => {
    expect(parseCssTime('700ms')).toBe(700);
    expect(parseCssTime(' 300ms ')).toBe(300);
    expect(parseCssTime('.7s')).toBe(700);
    expect(parseCssTime('0.3s')).toBe(300);
    expect(parseCssTime('1s')).toBe(1000);
  });

  it('bukan waktu menghasilkan NaN supaya pemanggil memakai nilai cadangan', () => {
    expect(parseCssTime('')).toBeNaN();
    expect(parseCssTime('700')).toBeNaN();
    expect(parseCssTime('cepat')).toBeNaN();
  });
});
