import { db } from '../../../lib/db/database';
import { generateRecoveryCode, hashSecret, normalizeRecoveryCode } from '../pin-crypto';
import { pinSchema } from '../schema';
import { SessionError } from './session-error';

// Mengembalikan kode pemulihan dalam teks biasa; hanya ini satu-satunya kesempatan menampilkannya.
export async function setupPin(pin: string): Promise<string> {
  if (!pinSchema.safeParse(pin).success) throw new SessionError('INVALID_PIN_FORMAT');

  const recoveryCode = generateRecoveryCode();
  const pinHash = await hashSecret(pin);
  const recoveryHash = await hashSecret(normalizeRecoveryCode(recoveryCode));

  await db.transaction('rw', db.settings, async () => {
    if (await db.settings.get('ownerPin')) throw new SessionError('PIN_ALREADY_SET');
    await db.settings.bulkPut([
      { key: 'ownerPin', value: pinHash },
      { key: 'recoveryCode', value: recoveryHash },
      { key: 'pinAttempts', value: { failed: 0, lockedUntil: null } },
    ]);
  });
  return recoveryCode;
}
