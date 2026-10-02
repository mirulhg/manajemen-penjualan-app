import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../lib/db';
import { DEFAULT_ACTOR } from './actor';
import { createProduct, CreateProductError } from './api/create-product';
import { getProducts } from './api/get-products';
import { getCategories } from './filter-products';
import { seedSampleProducts } from './seed';
import { getStockStatus } from './stock-status';
import type { NewProductInput } from './schema';

const VALID_INPUT: NewProductInput = {
  name: 'Kerupuk Udang 250 g',
  sku: 'MKR-006',
  category: 'Makanan Ringan',
  unit: 'bungkus',
  initialStock: '12',
  minStock: '',
  purchasePrice: '9.000',
  sellingPrice: '11.500',
};

function input(overrides: Partial<NewProductInput>): NewProductInput {
  return { ...VALID_INPUT, ...overrides };
}

async function findBySku(sku: string) {
  const product = await db.products.where('sku').equals(sku).first();
  if (!product) throw new Error(`Produk ${sku} tidak ditemukan`);
  return product;
}

describe('createProduct', () => {
  beforeEach(async () => {
    await db.products.clear();
    await db.stockMovements.clear();
    await seedSampleProducts();
  });

  it('menyimpan produk dan pergerakan awal', async () => {
    const created = await createProduct(VALID_INPUT);

    expect(await db.products.count()).toBe(31);
    expect(await db.stockMovements.count()).toBe(31);
    const movement = await db.stockMovements.where('productId').equals(created.id).first();
    expect(movement).toMatchObject({
      type: 'awal',
      quantityBefore: 0,
      quantityAfter: 12,
      actor: DEFAULT_ACTOR,
    });
    expect(created).toMatchObject({ purchasePrice: 9000, sellingPrice: 11500, minStock: null });
  });

  it('SKU di-trim dan diubah ke huruf besar', async () => {
    const created = await createProduct(input({ sku: ' sbk-099 ' }));
    expect(created.sku).toBe('SBK-099');
  });

  it('SKU kembar (tanpa memandang huruf besar/kecil) ditolak dengan nama pemiliknya', async () => {
    const promise = createProduct(input({ sku: 'sbk-001' }));

    await expect(promise).rejects.toBeInstanceOf(CreateProductError);
    await expect(promise).rejects.toMatchObject({
      code: 'DUPLICATE_SKU',
      ownerName: 'Beras Premium 5 kg',
      message: 'SKU SBK-001 sudah dipakai oleh Beras Premium 5 kg.',
    });
    expect(await db.products.count()).toBe(30);
    expect(await db.stockMovements.count()).toBe(30);
  });

  it('kategori yang hanya beda huruf besar/kecil memakai ejaan yang sudah ada', async () => {
    const created = await createProduct(input({ category: 'sembako' }));
    expect(created.category).toBe('Sembako');
  });

  it('kategori baru disimpan apa adanya dan muncul di daftar kategori', async () => {
    await createProduct(input({ category: ' Alat Tulis ' }));

    const categories = getCategories(await getProducts());
    expect(categories).toContain('Alat Tulis');
    expect(categories).toHaveLength(7);
  });

  it('satuan memakai ejaan yang sudah ada', async () => {
    const created = await createProduct(input({ unit: 'PCS' }));
    expect(created.unit).toBe('pcs');
  });

  it('batas minimum kosong menjadi null dan "0" menjadi 0', async () => {
    const empty = await createProduct(input({ sku: 'TES-001', minStock: '' }));
    const zero = await createProduct(input({ sku: 'TES-002', minStock: '0' }));
    expect(empty.minStock).toBeNull();
    expect(zero.minStock).toBe(0);
  });

  it.each([
    ['12.500', 12500],
    ['12500', 12500],
  ])('harga "%s" tersimpan sebagai %i', async (price, expected) => {
    const created = await createProduct(input({ purchasePrice: price }));
    expect(created.purchasePrice).toBe(expected);
  });

  it.each(['12,5', '1.2.3', '0', ''])('harga "%s" ditolak tanpa menyimpan apa pun', async (price) => {
    await expect(createProduct(input({ purchasePrice: price }))).rejects.toThrow();
    expect(await db.products.count()).toBe(30);
    expect(await db.stockMovements.count()).toBe(30);
  });

  it('stok awal 0 tersimpan dan berstatus habis', async () => {
    const created = await createProduct(input({ initialStock: '0' }));

    expect(created.stockQuantity).toBe(0);
    expect(getStockStatus(created.stockQuantity, created.minStock)).toBe('habis');
    expect(await db.stockMovements.count()).toBe(31);
  });

  it('nama terlalu pendek dan SKU dengan spasi ditolak', async () => {
    await expect(createProduct(input({ name: 'A' }))).rejects.toThrow();
    await expect(createProduct(input({ sku: 'ab c' }))).rejects.toThrow();
    expect(await db.products.count()).toBe(30);
  });

  it('stok awal tidak valid ditolak', async () => {
    await expect(createProduct(input({ initialStock: '-1' }))).rejects.toThrow();
    await expect(createProduct(input({ initialStock: '' }))).rejects.toThrow();
    expect(await db.products.count()).toBe(30);
  });

  it('harga jual di bawah harga beli tetap tersimpan', async () => {
    const created = await createProduct(input({ purchasePrice: '15.000', sellingPrice: '12.000' }));

    expect(created.sellingPrice).toBeLessThan(created.purchasePrice);
    expect((await findBySku('MKR-006')).sellingPrice).toBe(12000);
  });

  it('dua pembuatan bersamaan dengan SKU sama: satu tersimpan, satu DUPLICATE_SKU', async () => {
    const results = await Promise.allSettled([
      createProduct(input({ name: 'Barang Pertama' })),
      createProduct(input({ name: 'Barang Kedua' })),
    ]);

    const fulfilled = results.filter((result) => result.status === 'fulfilled');
    const rejected = results.filter((result) => result.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.reason).toMatchObject({ code: 'DUPLICATE_SKU' });
    expect(await db.products.where('sku').equals('MKR-006').count()).toBe(1);
    expect(await db.stockMovements.count()).toBe(31);
  });
});
