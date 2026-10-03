import { describe, expect, it } from 'vitest';

import { formatRecoveryCode, generateRecoveryCode, hashSecret, normalizeRecoveryCode, verifySecret } from './pin-crypto';

describe('pin-crypto', () => {
  it('PIN yang sama menghasilkan hash dan salt berbeda, tetapi keduanya terverifikasi', async () => {
    const first = await hashSecret('1357');
    const second = await hashSecret('1357');

    expect(first.salt).not.toBe(second.salt);
    expect(first.hash).not.toBe(second.hash);
    expect(first.iterations).toBe(100_000);
    expect(await verifySecret('1357', first)).toBe(true);
    expect(await verifySecret('1357', second)).toBe(true);
  });

  it('PIN yang salah ditolak', async () => {
    const stored = await hashSecret('1357');
    expect(await verifySecret('1358', stored)).toBe(false);
    expect(await verifySecret('', stored)).toBe(false);
  });

  it('kode pemulihan berformat XXXX-XXXX tanpa karakter yang mirip', () => {
    for (let index = 0; index < 50; index += 1) {
      expect(generateRecoveryCode()).toMatch(/^[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/);
    }
  });

  it('kode pemulihan dinormalkan: huruf kecil, spasi, dan tanda hubung diabaikan', () => {
    expect(normalizeRecoveryCode(' k7q2-m9xd ')).toBe('K7Q2M9XD');
    expect(formatRecoveryCode('K7Q2M9XD')).toBe('K7Q2-M9XD');
  });
});
