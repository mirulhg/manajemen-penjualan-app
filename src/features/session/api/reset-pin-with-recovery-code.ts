import { db } from '../../../lib/db/database';
import { generateRecoveryCode, hashSecret, normalizeRecoveryCode } from '../pin-crypto';
import { pinSchema } from '../schema';
import { verifyWithAttempts } from './pin-attempts';
import { SessionError } from './session-error';

// Kode lama hangus; kode pemulihan baru dikembalikan sekali untuk ditampilkan.
export async function resetPinWithRecoveryCode(code: string, newPin: string): Promise<string> {
  if (!pinSchema.safeParse(newPin).success) throw new SessionError('INVALID_PIN_FORMAT');

  await verifyWithAttempts(normalizeRecoveryCode(code), 'recoveryCode');
  const newCode = generateRecoveryCode();
  const pinHash = await hashSecret(newPin);
  const recoveryHash = await hashSecret(normalizeRecoveryCode(newCode));
  await db.settings.bulkPut([
    { key: 'ownerPin', value: pinHash },
    { key: 'recoveryCode', value: recoveryHash },
  ]);
  return newCode;
}
