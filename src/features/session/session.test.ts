import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../../lib/db/database';
import { findProductBySku, resetDatabaseWithSeed } from '../../test/reset-database';
import { createSale } from '../sales/api/create-sale';
import { enterCashierMode, exitCashierMode } from './api/cashier-mode';
import { changePin } from './api/change-pin';
import { getSession } from './api/get-session';
import { resetPinWithRecoveryCode } from './api/reset-pin-with-recovery-code';
import { setAllowOversell } from './api/set-allow-oversell';
import { setupPin } from './api/setup-pin';

const NOW = new Date(2026, 9, 3, 10, 0, 0);

async function failPin(times: number) {
  for (let index = 0; index < times; index += 1) {
    await exitCashierMode('0000').catch(() => undefined);
  }
}

async function failures(promise: Promise<unknown>) {
  return promise.then(
    () => null,
    (error: unknown) => error,
  );
}

describe('session', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    await resetDatabaseWithSeed();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('PIN dan kode pemulihan tidak pernah tersimpan sebagai teks biasa', async () => {
    const code = await setupPin('1357');

    const stored = JSON.stringify(await db.settings.toArray());
    expect(stored).toContain('ownerPin');
    expect(stored).not.toContain('1357');
    expect(stored).not.toContain(code);
    expect(stored).not.toContain(code.replace('-', ''));
    expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  it('setupPin dua kali: PIN_ALREADY_SET; format salah: INVALID_PIN_FORMAT', async () => {
    for (const pin of ['12a4', '123', '1234567', '']) {
      await expect(setupPin(pin)).rejects.toMatchObject({ code: 'INVALID_PIN_FORMAT' });
    }
    await setupPin('1357');
    await expect(setupPin('2468')).rejects.toMatchObject({ code: 'PIN_ALREADY_SET' });
  });

  it('masuk Mode Kasir butuh PIN; mode tersimpan dan keluar butuh PIN yang benar', async () => {
    await expect(enterCashierMode()).rejects.toMatchObject({ code: 'PIN_NOT_SET' });
    await setupPin('1357');
    expect(await getSession()).toEqual({ isCashierMode: false, hasPin: true, defaultMinStock: 5 });

    await enterCashierMode();
    expect(await getSession()).toEqual({ isCashierMode: true, hasPin: true, defaultMinStock: 5 });

    await expect(exitCashierMode('2468')).rejects.toMatchObject({ code: 'WRONG_PIN', remainingAttempts: 4 });
    expect((await getSession()).isCashierMode).toBe(true);
    await exitCashierMode('1357');
    expect((await getSession()).isCashierMode).toBe(false);
  });

  it('5 kali salah: 4 kali WRONG_PIN, lalu LOCKED 60 detik; PIN benar saat terkunci tetap ditolak', async () => {
    await setupPin('1357');
    await enterCashierMode();

    for (const remaining of [4, 3, 2, 1]) {
      await expect(exitCashierMode('0000')).rejects.toMatchObject({ code: 'WRONG_PIN', remainingAttempts: remaining });
    }
    const lock = await failures(exitCashierMode('0000'));
    expect(lock).toMatchObject({ code: 'LOCKED', lockedUntil: new Date(NOW.getTime() + 60_000).toISOString() });

    await expect(exitCashierMode('1357')).rejects.toMatchObject({ code: 'LOCKED' });
    expect((await getSession()).isCashierMode).toBe(true);
  });

  it('setelah 60 detik PIN benar diterima dan hitungan salah kembali 0', async () => {
    await setupPin('1357');
    await enterCashierMode();
    await failPin(5);

    vi.setSystemTime(new Date(NOW.getTime() + 61_000));
    await exitCashierMode('1357');

    expect((await getSession()).isCashierMode).toBe(false);
    expect((await db.settings.get('pinAttempts'))?.value).toEqual({ failed: 0, lockedUntil: null });
  });

  it('changePin memeriksa PIN lama dan memberlakukan PIN baru', async () => {
    await setupPin('1357');
    await expect(changePin('0000', '2468')).rejects.toMatchObject({ code: 'WRONG_PIN' });
    await expect(changePin('1357', '12')).rejects.toMatchObject({ code: 'INVALID_PIN_FORMAT' });

    await changePin('1357', '2468');
    await enterCashierMode();
    await expect(exitCashierMode('1357')).rejects.toMatchObject({ code: 'WRONG_PIN' });
    await exitCashierMode('2468');
  });

  it('kode pemulihan: PIN baru berlaku, kode lama hangus, kode baru dikembalikan', async () => {
    const oldCode = await setupPin('1357');

    const newCode = await resetPinWithRecoveryCode(oldCode.toLowerCase(), '2468');
    expect(newCode).not.toBe(oldCode);

    await enterCashierMode();
    await expect(exitCashierMode('1357')).rejects.toMatchObject({ code: 'WRONG_PIN' });
    await expect(resetPinWithRecoveryCode(oldCode, '9999')).rejects.toMatchObject({ code: 'WRONG_PIN' });
    await exitCashierMode('2468');

    await enterCashierMode();
    await exitCashierMode(newCode);
    expect((await getSession()).isCashierMode).toBe(false);
  });

  it('pelaku transaksi mengikuti mode: Kasir saat Mode Kasir, Pemilik setelah keluar', async () => {
    await setupPin('1357');
    const product = await findProductBySku('SBK-001');
    const input = {
      items: [{ productId: product.id, quantity: 1, discount: 0 }],
      paymentMethod: 'tunai' as const,
      transactionDiscount: 0,
      amountPaid: 74000,
      expectedTotal: 74000,
    };

    await enterCashierMode();
    const asCashier = await createSale(input);
    await exitCashierMode('1357');
    const asOwner = await createSale(input);

    expect(asCashier.actor).toBe('Kasir');
    expect(asOwner.actor).toBe('Pemilik');
    const movements = (await db.stockMovements.toArray()).filter((movement) => movement.type === 'jual');
    expect(movements.filter((movement) => movement.saleId === asCashier.id).map((movement) => movement.actor)).toEqual(['Kasir']);
    expect(movements.filter((movement) => movement.saleId === asOwner.id).map((movement) => movement.actor)).toEqual(['Pemilik']);
  });

  it('izin jual melebihi stok dari pengaturan: Telur Ayam (stok 0) terjual dan stok menjadi -1', async () => {
    const product = await findProductBySku('SBK-005');
    const input = {
      items: [{ productId: product.id, quantity: 1, discount: 0 }],
      paymentMethod: 'tunai' as const,
      transactionDiscount: 0,
      amountPaid: 30000,
      expectedTotal: 30000,
    };
    await expect(createSale(input)).rejects.toMatchObject({ code: 'INSUFFICIENT_STOCK' });

    await setAllowOversell(true);
    await createSale(input);

    expect((await db.products.get(product.id))?.stockQuantity).toBe(-1);
  });
});
