import { db } from '../../../lib/db/database';
import { hashSecret } from '../pin-crypto';
import { pinSchema } from '../schema';
import { verifyWithAttempts } from './pin-attempts';
import { SessionError } from './session-error';

export async function changePin(oldPin: string, newPin: string): Promise<void> {
  if (!pinSchema.safeParse(newPin).success) throw new SessionError('INVALID_PIN_FORMAT');

  await verifyWithAttempts(oldPin, 'ownerPin');
  await db.settings.put({ key: 'ownerPin', value: await hashSecret(newPin) });
}
