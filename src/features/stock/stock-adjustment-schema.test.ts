import { describe, expect, it } from 'vitest';

import { stockAdjustmentSchema } from './schema';

function messageFor(input: { type: 'masuk' | 'koreksi'; quantity: string; reason: string }) {
  const result = stockAdjustmentSchema.safeParse(input);
  return result.success ? null : result.error.issues[0]?.message;
}

describe('stockAdjustmentSchema', () => {
  const reason = 'Kiriman supplier';

  it('menerima jumlah valid dan mengubahnya menjadi angka', () => {
    const result = stockAdjustmentSchema.parse({ type: 'masuk', quantity: ' 7 ', reason: `  ${reason}  ` });
    expect(result).toEqual({ type: 'masuk', quantity: 7, reason });
  });

  it('koreksi boleh 0', () => {
    expect(messageFor({ type: 'koreksi', quantity: '0', reason })).toBeNull();
  });

  it('menolak jumlah kosong', () => {
    expect(messageFor({ type: 'masuk', quantity: '', reason })).toBe('Isi jumlah barang.');
  });

  it.each(['2,5', '2.5', '-3', 'abc'])('menolak jumlah "%s" yang bukan bilangan bulat', (quantity) => {
    expect(messageFor({ type: 'masuk', quantity, reason })).toBe(
      'Jumlah harus bilangan bulat tanpa koma.',
    );
  });

  it('menolak stok masuk 0', () => {
    expect(messageFor({ type: 'masuk', quantity: '0', reason })).toBe('Jumlah masuk minimal 1.');
  });

  it('menolak jumlah di atas 100000', () => {
    expect(messageFor({ type: 'masuk', quantity: '100001', reason })).toBe(
      'Jumlah terlalu besar. Periksa kembali angkanya.',
    );
    expect(messageFor({ type: 'masuk', quantity: '100000', reason })).toBeNull();
  });

  it('menolak alasan kurang dari 3 karakter setelah di-trim', () => {
    const expected = 'Tulis alasan minimal 3 karakter.';
    expect(messageFor({ type: 'masuk', quantity: '1', reason: 'ab' })).toBe(expected);
    expect(messageFor({ type: 'masuk', quantity: '1', reason: '   ' })).toBe(expected);
  });
});
