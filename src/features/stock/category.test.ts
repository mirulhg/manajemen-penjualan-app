import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../../lib/db/database';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { createCategory } from './api/create-category';
import { createProduct } from './api/create-product';
import { deleteCategory } from './api/delete-category';
import { archiveProduct } from './api/archive-product';
import { getCategoriesWithCounts } from './api/get-categories';
import { renameCategory } from './api/rename-category';
import type { NewProductInput } from './schema';

const NEW_PRODUCT: NewProductInput = {
  name: 'Pensil 2B',
  sku: 'ATK-001',
  category: 'alat tulis',
  unit: 'pcs',
  initialStock: '10',
  minStock: '',
  purchasePrice: '1.500',
  sellingPrice: '2.500',
};

async function categoryId(name: string) {
  const category = (await getCategoriesWithCounts()).find((item) => item.name === name);
  if (!category) throw new Error(`Kategori ${name} tidak ada`);
  return category.id;
}

describe('kategori', () => {
  beforeEach(resetDatabaseWithSeed);

  it('createProduct dengan kategori baru membuatnya, produk berikutnya memakai ejaan yang sama', async () => {
    const first = await createProduct(NEW_PRODUCT);
    const second = await createProduct({ ...NEW_PRODUCT, sku: 'ATK-002', category: 'ALAT TULIS' });

    expect(first.category).toBe('alat tulis');
    expect(second.category).toBe('alat tulis');
    expect(await db.categories.count()).toBe(7);
  });

  it('createCategory lalu deleteCategory berhasil; nama yang sudah ada (beda huruf) ditolak', async () => {
    const created = await createCategory('Alat Tulis');
    expect(await db.categories.count()).toBe(7);

    await deleteCategory(created.id);
    expect(await db.categories.count()).toBe(6);

    await expect(createCategory('sembako')).rejects.toMatchObject({ code: 'DUPLICATE_CATEGORY' });
    await expect(createCategory('a')).rejects.toThrow();
  });

  it('getCategoriesWithCounts terurut A–Z dan memisahkan aktif dari arsip', async () => {
    await archiveProduct((await findProductBySku('MKR-005')).id);
    await createCategory('Alat Tulis');

    const categories = await getCategoriesWithCounts();

    expect(categories.map((category) => category.name)).toEqual([
      'Alat Tulis',
      'Bumbu Dapur',
      'Kebutuhan Rumah',
      'Makanan Ringan',
      'Minuman',
      'Perlengkapan Mandi',
      'Sembako',
    ]);
    expect(categories.find((category) => category.name === 'Alat Tulis')).toMatchObject({ activeCount: 0, archivedCount: 0 });
    expect(categories.find((category) => category.name === 'Makanan Ringan')).toMatchObject({ activeCount: 4, archivedCount: 1 });
    expect(categories.find((category) => category.name === 'Sembako')).toMatchObject({ activeCount: 6, archivedCount: 0 });
  });

  it('renameCategory mengubah semua produk tanpa mengubah updatedAt', async () => {
    const before = await db.products.where('category').equals('Bumbu Dapur').toArray();
    expect(before).toHaveLength(5);

    await renameCategory(await categoryId('Bumbu Dapur'), 'Bumbu & Rempah');

    const after = await db.products.where('category').equals('Bumbu & Rempah').toArray();
    expect(after).toHaveLength(5);
    for (const product of after) {
      expect(product.updatedAt).toBe(before.find((item) => item.id === product.id)?.updatedAt);
    }
    expect(await db.products.where('category').equals('Bumbu Dapur').count()).toBe(0);
    const names = (await getCategoriesWithCounts()).map((category) => category.name);
    expect(names).toContain('Bumbu & Rempah');
    expect(names).not.toContain('Bumbu Dapur');
  });

  it('renameCategory ikut mengubah produk yang diarsipkan', async () => {
    const product = await findProductBySku('MKR-005');
    await archiveProduct(product.id);

    await renameCategory(await categoryId('Makanan Ringan'), 'Camilan');

    expect((await db.products.get(product.id))?.category).toBe('Camilan');
  });

  it('renameCategory: nama kategori lain ditolak, beda huruf saja berhasil, nama sama persis NO_CHANGE', async () => {
    const minuman = await categoryId('Minuman');

    await expect(renameCategory(minuman, 'sembako')).rejects.toMatchObject({ code: 'DUPLICATE_CATEGORY' });
    await expect(renameCategory(minuman, 'Minuman')).rejects.toMatchObject({ code: 'NO_CHANGE' });
    await renameCategory(minuman, 'MINUMAN');

    expect(await db.products.where('category').equals('MINUMAN').count()).toBe(6);
    await expect(renameCategory(crypto.randomUUID(), 'Baru')).rejects.toMatchObject({ code: 'CATEGORY_NOT_FOUND' });
  });

  it('renameCategory atomik: bila pembaruan produk gagal, kategori tidak berubah', async () => {
    const id = await categoryId('Bumbu Dapur');
    const spy = vi.spyOn(db.products, 'where').mockImplementationOnce(() => {
      throw new Error('gagal menulis produk');
    });

    await expect(renameCategory(id, 'Bumbu & Rempah')).rejects.toThrow('gagal menulis produk');
    spy.mockRestore();

    expect((await db.categories.get(id))?.name).toBe('Bumbu Dapur');
    expect(await db.products.where('category').equals('Bumbu Dapur').count()).toBe(5);
  });

  it('deleteCategory ditolak bila dipakai barang, termasuk bila semuanya arsip', async () => {
    await expect(deleteCategory(await categoryId('Sembako'))).rejects.toMatchObject({
      code: 'CATEGORY_NOT_EMPTY',
      usageCount: 6,
    });

    const created = await createProduct(NEW_PRODUCT);
    await archiveProduct(created.id);
    await expect(deleteCategory(await categoryId('alat tulis'))).rejects.toMatchObject({
      code: 'CATEGORY_NOT_EMPTY',
      usageCount: 1,
    });
    await expect(deleteCategory(crypto.randomUUID())).rejects.toMatchObject({ code: 'CATEGORY_NOT_FOUND' });
  });
});
