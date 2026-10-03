import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../../lib/db/database';
import { findProductBySku, resetDatabaseWithSeed } from '../../../test/reset-database';
import { compressPhoto, MAX_PHOTO_FILE_BYTES, PhotoError } from './compress-photo';
import { fitWithin } from './fit-within';
import { getProductPhoto, removeProductPhoto, saveProductPhoto } from './product-photo-store';

describe('fitWithin', () => {
  it.each([
    [4000, 3000, 800, 600],
    [3000, 4000, 600, 800],
    [600, 800, 600, 800],
    [800, 800, 800, 800],
    [100, 50, 100, 50],
  ])('%i×%i dengan batas 800 menjadi %i×%i', (width, height, expectedWidth, expectedHeight) => {
    expect(fitWithin(width, height, 800)).toEqual({ width: expectedWidth, height: expectedHeight });
  });

  it('tidak pernah memperbesar gambar kecil', () => {
    const result = fitWithin(200, 100, 800);
    expect(result.width).toBeLessThanOrEqual(200);
  });
});

describe('compressPhoto: penolakan file', () => {
  it('menolak file yang bukan gambar', async () => {
    const file = new File(['halo'], 'catatan.txt', { type: 'text/plain' });
    await expect(compressPhoto(file)).rejects.toMatchObject({ code: 'NOT_AN_IMAGE' });
    await expect(compressPhoto(file)).rejects.toBeInstanceOf(PhotoError);
  });

  it('menolak gambar lebih dari 10 MB', async () => {
    const huge = new File([new Uint8Array(MAX_PHOTO_FILE_BYTES + 1)], 'besar.jpg', { type: 'image/jpeg' });
    await expect(compressPhoto(huge)).rejects.toMatchObject({ code: 'TOO_LARGE' });
  });
});

describe('penyimpanan foto produk', () => {
  beforeEach(resetDatabaseWithSeed);

  it('menyimpan, membaca, mengganti, dan menghapus foto', async () => {
    const product = await findProductBySku('SBK-001');
    expect(await getProductPhoto(product.id)).toBeNull();

    await saveProductPhoto(product.id, { blob: new Blob(['abc'], { type: 'image/webp' }), width: 600, height: 400 });
    const saved = await getProductPhoto(product.id);
    expect(saved).toMatchObject({ productId: product.id, width: 600, height: 400 });
    expect(saved?.blob.size).toBe(3);

    await saveProductPhoto(product.id, { blob: new Blob(['abcdef'], { type: 'image/webp' }), width: 300, height: 200 });
    expect((await getProductPhoto(product.id))?.blob.size).toBe(6);
    expect(await db.productPhotos.count()).toBe(1);

    await removeProductPhoto(product.id);
    expect(await getProductPhoto(product.id)).toBeNull();
  });

  it('foto untuk barang yang tidak ada ditolak dan tidak tersimpan', async () => {
    await expect(
      saveProductPhoto(crypto.randomUUID(), { blob: new Blob(['abc']), width: 10, height: 10 }),
    ).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND' });
    expect(await db.productPhotos.count()).toBe(0);
  });
});
