import { describe, expect, it } from 'vitest';

import { parseBold } from './parse-bold';

describe('parseBold', () => {
  it('memecah teks menjadi segmen biasa dan tebal', () => {
    expect(parseBold('Buka **Stok**, lalu tekan "Simpan".')).toEqual([
      { text: 'Buka ', isBold: false },
      { text: 'Stok', isBold: true },
      { text: ', lalu tekan "Simpan".', isBold: false },
    ]);
  });

  it('mengenali beberapa bagian tebal dan teks yang diawali tebal', () => {
    expect(parseBold('**Retur:** barang kembali, **Batal:** semua')).toEqual([
      { text: 'Retur:', isBold: true },
      { text: ' barang kembali, ', isBold: false },
      { text: 'Batal:', isBold: true },
      { text: ' semua', isBold: false },
    ]);
  });

  it('mengembalikan teks polos apa adanya', () => {
    expect(parseBold('Tanpa format')).toEqual([{ text: 'Tanpa format', isBold: false }]);
  });

  it('menampilkan penanda yang tidak berpasangan apa adanya', () => {
    expect(parseBold('Ada **satu penanda')).toEqual([{ text: 'Ada **satu penanda', isBold: false }]);
  });
});
