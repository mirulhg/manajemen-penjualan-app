import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../../lib/db/database';
import { getStoreProfile } from '../../lib/db/settings';
import { resetDatabaseWithSeed } from '../../test/reset-database';
import { compressPhoto } from '../stock';
import { saveStoreProfile } from './api/save-store-profile';
import { LOGO_MAX_SIDE } from './schema';
import type { LogoDraft } from './schema';

const UNCHANGED: LogoDraft = { kind: 'unchanged' };
const LOGO = { blob: new Blob(['logo'], { type: 'image/webp' }), width: 300, height: 200 };

describe('profil toko', () => {
  beforeEach(resetDatabaseWithSeed);

  it('belum diisi: null', async () => {
    expect(await getStoreProfile()).toBeNull();
  });

  it('menyimpan nama, alamat, telepon, dan merapikan spasi', async () => {
    await saveStoreProfile({ name: '  Toko Sari Makmur ', address: ' Jl. Melati 5 ', phone: ' 0812-3456 789 ' }, UNCHANGED);

    expect(await getStoreProfile()).toEqual({
      name: 'Toko Sari Makmur',
      address: 'Jl. Melati 5',
      phone: '0812-3456 789',
      logo: null,
    });
  });

  it('alamat dan telepon boleh kosong', async () => {
    await saveStoreProfile({ name: 'Toko Sari', address: '', phone: '' }, UNCHANGED);

    expect(await getStoreProfile()).toMatchObject({ address: '', phone: '' });
  });

  it.each([
    [{ name: 'A', address: '', phone: '' }, 'Tulis nama toko minimal 2 karakter.'],
    [{ name: 'B'.repeat(61), address: '', phone: '' }, 'Nama toko maksimal 60 karakter.'],
    [{ name: 'Toko Sari', address: 'x'.repeat(201), phone: '' }, 'Alamat maksimal 200 karakter.'],
    [{ name: 'Toko Sari', address: '', phone: 'abc' }, 'Telepon hanya boleh angka'],
    [{ name: 'Toko Sari', address: '', phone: '12345' }, 'Telepon hanya boleh angka'],
    [{ name: 'Toko Sari', address: '', phone: '1'.repeat(21) }, 'Telepon hanya boleh angka'],
  ])('isian tidak valid ditolak dan tidak tersimpan: %j', async (input, message) => {
    await expect(saveStoreProfile(input, UNCHANGED)).rejects.toThrow(message);
    expect(await db.settings.get('storeProfile')).toBeUndefined();
  });

  it('logo: diganti, dipertahankan saat tidak disentuh, lalu dihapus', async () => {
    const values = { name: 'Toko Sari', address: '', phone: '' };

    await saveStoreProfile(values, { kind: 'replace', logo: LOGO });
    expect((await getStoreProfile())?.logo).toMatchObject({ width: 300, height: 200 });

    await saveStoreProfile({ ...values, name: 'Toko Sari Baru' }, UNCHANGED);
    expect(await getStoreProfile()).toMatchObject({ name: 'Toko Sari Baru', logo: { width: 300, height: 200 } });

    await saveStoreProfile(values, { kind: 'remove' });
    expect((await getStoreProfile())?.logo).toBeNull();
  });
});

describe('logo dikompres', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sisi terpanjang tidak melebihi 400px dengan rasio tetap', async () => {
    vi.stubGlobal('createImageBitmap', () => Promise.resolve({ width: 2000, height: 1000, close: () => undefined }));
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        getContext() {
          return { drawImage: () => undefined };
        }
        convertToBlob() {
          return Promise.resolve(new Blob(['x'], { type: 'image/webp' }));
        }
      },
    );

    const logo = await compressPhoto(new File(['x'], 'logo.png', { type: 'image/png' }), LOGO_MAX_SIDE);

    expect(logo).toMatchObject({ width: 400, height: 200 });
  });
});
