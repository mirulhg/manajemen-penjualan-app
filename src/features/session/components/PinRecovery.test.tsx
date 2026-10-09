// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../../lib/db/database';
import { renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { setupPin } from '../api/setup-pin';
import { verifySecret } from '../pin-crypto';
import { PinSection } from './PinSection';

const CODE_PATTERN = /^[A-Z2-9]{4}-[A-Z2-9]{4}$/;

async function readOwnerPin() {
  const row = await db.settings.get('ownerPin');
  if (row?.key !== 'ownerPin') throw new Error('PIN pemilik belum dibuat');
  return row.value;
}

async function openRecovery() {
  const user = userEvent.setup();
  const recoveryCode = await setupPin('1357');
  renderWithProviders(<PinSection />, undefined, '/', { hasPin: true });
  await user.click(await screen.findByRole('button', { name: 'Lupa PIN?' }));
  return { user, recoveryCode };
}

describe('Lupa PIN? di Pengaturan', () => {
  beforeEach(resetDatabaseWithSeed);

  it('mengganti form Ubah PIN dengan form pulihkan; Batal mengembalikannya', async () => {
    const { user } = await openRecovery();

    expect(screen.getByLabelText('Kode pemulihan')).toBeTruthy();
    expect(screen.getByLabelText('PIN baru')).toBeTruthy();
    expect(screen.getByLabelText('Isi ulang PIN baru')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Simpan PIN baru' })).toBeTruthy();
    expect(screen.queryByLabelText('PIN lama')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Batal' }));

    expect(screen.getByLabelText('PIN lama')).toBeTruthy();
    expect(screen.queryByLabelText('Kode pemulihan')).toBeNull();
    expect(screen.getByRole('button', { name: 'Lupa PIN?' })).toBeTruthy();
  });

  it('kode salah: pesan sisa percobaan di bawah field kode, PIN tidak berubah', async () => {
    const { user } = await openRecovery();
    const before = await readOwnerPin();

    await user.type(screen.getByLabelText('Kode pemulihan'), 'SALAH-SALAH');
    await user.type(screen.getByLabelText('PIN baru'), '2468');
    await user.type(screen.getByLabelText('Isi ulang PIN baru'), '2468');
    await user.click(screen.getByRole('button', { name: 'Simpan PIN baru' }));

    expect(await screen.findByText('PIN salah. Sisa percobaan 4.')).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Kode pemulihan').value).toBe('SALAH-SALAH');
    expect(await readOwnerPin()).toEqual(before);
    expect(screen.queryByText(CODE_PATTERN)).toBeNull();
  });

  it('kode benar: PIN baru berlaku, kode pemulihan baru tampil, toast muncul, mode tidak berubah', async () => {
    const { user, recoveryCode } = await openRecovery();

    await user.type(screen.getByLabelText('Kode pemulihan'), recoveryCode);
    await user.type(screen.getByLabelText('PIN baru'), '2468');
    await user.type(screen.getByLabelText('Isi ulang PIN baru'), '2468');
    await user.click(screen.getByRole('button', { name: 'Simpan PIN baru' }));

    const newCode = await screen.findByText(CODE_PATTERN);
    expect(newCode.textContent).not.toBe(recoveryCode);
    expect(await screen.findByText('PIN diganti')).toBeTruthy();
    expect(await verifySecret('2468', await readOwnerPin())).toBe(true);
    expect(await verifySecret('1357', await readOwnerPin())).toBe(false);
    expect(await db.settings.get('cashierMode')).toBeUndefined();

    await user.click(screen.getByRole('button', { name: 'Sudah saya catat' }));
    expect(screen.getByLabelText('PIN lama')).toBeTruthy();
  });

  it('PIN baru yang tidak sama ditolak dan tidak ada yang berubah', async () => {
    const { user, recoveryCode } = await openRecovery();
    const before = await readOwnerPin();

    await user.type(screen.getByLabelText('Kode pemulihan'), recoveryCode);
    await user.type(screen.getByLabelText('PIN baru'), '2468');
    await user.type(screen.getByLabelText('Isi ulang PIN baru'), '2469');
    await user.click(screen.getByRole('button', { name: 'Simpan PIN baru' }));

    expect(await screen.findByText('Isi ulang PIN harus sama dengan PIN baru.')).toBeTruthy();
    expect(await readOwnerPin()).toEqual(before);
  });
});
