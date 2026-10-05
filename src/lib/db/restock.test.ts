import { describe, expect, it } from 'vitest';

import { buildRestockShareText, suggestRestockQuantity } from './restock';

function suggest(stock: number, minStock: number | null, soldLast14Days = 0, defaultMinStock = 5) {
  return suggestRestockQuantity({ stock, minStock, defaultMinStock, soldLast14Days });
}

describe('suggestRestockQuantity', () => {
  it('tanpa penjualan: batas + 1 dikurangi stok', () => {
    expect(suggest(3, 10)).toBe(8); // Minyak Goreng 2 L
    expect(suggest(0, 5)).toBe(6); // Telur Ayam 1 kg
    expect(suggest(0, 12)).toBe(13); // Teh Siap Minum 350 ml
    expect(suggest(0, 3)).toBe(4); // Roti Tawar
    expect(suggest(1, null)).toBe(5); // Penyedap Rasa 100 g (batas default 5)
    expect(suggest(6, 6)).toBe(1); // Sabun Cuci Piring 780 ml
    expect(suggest(18, 20)).toBe(3); // Mi Instan Kuah Ayam
  });

  it('dengan penjualan: yang lebih besar antara kebutuhan 14 hari dan batas + 1', () => {
    expect(suggest(0, 5, 4)).toBe(6); // Telur Ayam: 4 < batas + 1
    expect(suggest(11, 5, 14)).toBe(3); // Kecap Manis: kebutuhan 14 hari menang
    expect(suggest(3, 10, 5)).toBe(8); // Minyak Goreng
  });

  it('stok cukup menghasilkan 0 (belum perlu), dan batas default ikut pengaturan', () => {
    expect(suggest(18, 5, 5)).toBe(0);
    expect(suggest(1, null, 0, 10)).toBe(10);
  });
});

describe('buildRestockShareText', () => {
  it('memuat judul bertanggal dan semua baris, tanpa harga beli', () => {
    const text = buildRestockShareText(
      [
        { name: 'Minyak Goreng 2 L', quantity: 8, unit: 'pouch' },
        { name: 'Telur Ayam 1 kg', quantity: 6, unit: 'pack' },
      ],
      new Date(2026, 9, 4),
    );

    expect(text.split('\n')).toEqual([
      'Daftar belanja barang - 4 Oktober 2026',
      '- Minyak Goreng 2 L: 8 pouch',
      '- Telur Ayam 1 kg: 6 pack',
    ]);
    expect(text).not.toMatch(/Rp|34\.?000|27\.?000/);
  });

  it('memakai nama toko pada judul bila ada', () => {
    const text = buildRestockShareText([{ name: 'Telur Ayam 1 kg', quantity: 6, unit: 'pack' }], new Date(2026, 9, 4), 'Toko Sari Makmur');

    expect(text.split('\n')[0]).toBe('Daftar belanja Toko Sari Makmur - 4 Oktober 2026');
  });
});
