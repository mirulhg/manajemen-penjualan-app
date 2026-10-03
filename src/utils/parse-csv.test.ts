import { describe, expect, it } from 'vitest';

import { parseCsv } from './parse-csv';

describe('parseCsv', () => {
  it('mengenali pemisah titik koma dan koma dari baris pertama', () => {
    expect(parseCsv('a;b;c\n1;2;3')).toEqual([['a', 'b', 'c'], ['1', '2', '3']]);
    expect(parseCsv('a,b,c\n1,2,3')).toEqual([['a', 'b', 'c'], ['1', '2', '3']]);
  });

  it('pemisah lain di dalam sel tidak memecahnya saat sel dikutip', () => {
    expect(parseCsv('a;b\n"1;5";"x,y"')).toEqual([['a', 'b'], ['1;5', 'x,y']]);
  });

  it('tanda kutip ganda di dalam kutip', () => {
    expect(parseCsv('a;"b";c\n"a;""b"";c";2;3')).toEqual([['a', 'b', 'c'], ['a;"b";c', '2', '3']]);
  });

  it('baris baru di dalam kutip tetap satu sel', () => {
    expect(parseCsv('a;b\n"baris 1\nbaris 2";x')).toEqual([['a', 'b'], ['baris 1\nbaris 2', 'x']]);
  });

  it('membuang BOM dan menerima CRLF', () => {
    expect(parseCsv('﻿SKU;Nama\r\nA-1;Beras\r\n')).toEqual([['SKU', 'Nama'], ['A-1', 'Beras']]);
  });

  it('mengabaikan baris kosong di akhir, tetapi mempertahankan yang di tengah agar nomor baris tetap', () => {
    expect(parseCsv('a;b\n1;2\n\n3;4\n\n\n')).toEqual([['a', 'b'], ['1', '2'], [''], ['3', '4']]);
  });

  it('sel kosong dan baris tanpa baris baru di akhir', () => {
    expect(parseCsv('a;b;c\n1;;3')).toEqual([['a', 'b', 'c'], ['1', '', '3']]);
    expect(parseCsv('')).toEqual([]);
  });
});
