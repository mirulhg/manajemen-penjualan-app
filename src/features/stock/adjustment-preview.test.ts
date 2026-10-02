import { describe, expect, it } from 'vitest';

import { getAdjustmentPreview } from './adjustment-preview';

describe('getAdjustmentPreview', () => {
  it('stok masuk menambah ke stok sekarang', () => {
    expect(getAdjustmentPreview('masuk', 18, '7')).toEqual({ quantityAfter: 25, delta: 7 });
  });

  it('koreksi memakai hasil hitung dan menghitung selisih negatif', () => {
    expect(getAdjustmentPreview('koreksi', 18, '15')).toEqual({ quantityAfter: 15, delta: -3 });
  });

  it('koreksi ke angka yang sama memberi selisih 0', () => {
    expect(getAdjustmentPreview('koreksi', 4, '4')).toEqual({ quantityAfter: 4, delta: 0 });
  });

  it('mengabaikan spasi di sekitar angka', () => {
    expect(getAdjustmentPreview('masuk', 18, ' 7 ')).toEqual({ quantityAfter: 25, delta: 7 });
  });

  it.each(['', 'abc', '2,5', '-3'])('jumlah "%s" yang tidak valid tidak punya pratinjau', (text) => {
    expect(getAdjustmentPreview('masuk', 18, text)).toBeNull();
  });

  it('stok masuk 0 tidak punya pratinjau, tetapi koreksi ke 0 punya', () => {
    expect(getAdjustmentPreview('masuk', 18, '0')).toBeNull();
    expect(getAdjustmentPreview('koreksi', 18, '0')).toEqual({ quantityAfter: 0, delta: -18 });
  });

  it('batas atas 100000 masih valid, 100001 tidak', () => {
    expect(getAdjustmentPreview('masuk', 0, '100000')).toEqual({
      quantityAfter: 100000,
      delta: 100000,
    });
    expect(getAdjustmentPreview('masuk', 0, '100001')).toBeNull();
  });
});
