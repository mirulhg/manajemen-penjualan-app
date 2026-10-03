import { db } from '../../../lib/db/database';
import { normalizeRecoveryCode } from '../pin-crypto';
import { pinSchema } from '../schema';
import { verifyWithAttempts } from './pin-attempts';
import { SessionError } from './session-error';

export async function enterCashierMode(): Promise<void> {
  await db.transaction('rw', db.settings, async () => {
    if (!(await db.settings.get('ownerPin'))) throw new SessionError('PIN_NOT_SET');
    await db.settings.put({ key: 'cashierMode', value: true });
  });
}

// Angka 4–6 digit diperiksa sebagai PIN; selain itu sebagai kode pemulihan. Keduanya memakai satu aturan percobaan.
export async function exitCashierMode(pinOrRecoveryCode: string): Promise<void> {
  const isPin = pinSchema.safeParse(pinOrRecoveryCode).success;
  await verifyWithAttempts(
    isPin ? pinOrRecoveryCode : normalizeRecoveryCode(pinOrRecoveryCode),
    isPin ? 'ownerPin' : 'recoveryCode',
  );
  await db.settings.put({ key: 'cashierMode', value: false });
}
