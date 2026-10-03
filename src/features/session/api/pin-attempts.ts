import { db } from '../../../lib/db/database';
import { hashedSecretSchema, pinAttemptsSchema } from '../../../lib/db/records';
import type { HashedSecret } from '../../../lib/db/records';
import { verifySecret } from '../pin-crypto';
import { SessionError } from './session-error';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_DURATION_MS = 60_000;

type SecretKey = 'ownerPin' | 'recoveryCode';
type Attempts = { failed: number; lockedUntil: string | null };

async function readAttempts(): Promise<Attempts> {
  const row = await db.settings.get('pinAttempts');
  return row ? pinAttemptsSchema.parse(row.value) : { failed: 0, lockedUntil: null };
}

function activeLock(attempts: Attempts): string | null {
  return attempts.lockedUntil !== null && Date.parse(attempts.lockedUntil) > Date.now() ? attempts.lockedUntil : null;
}

export async function readSecret(key: SecretKey): Promise<HashedSecret | null> {
  const row = await db.settings.get(key);
  return row ? hashedSecretSchema.parse(row.value) : null;
}

// Hash dihitung di luar transaksi (crypto.subtle bukan IndexedDB, transaksi bisa tertutup sendiri);
// hasilnya dicatat di transaksi terpisah yang membaca ulang percobaan, jadi dua tab tetap konsisten.
export async function verifyWithAttempts(candidate: string, key: SecretKey): Promise<void> {
  const lockedBefore = activeLock(await readAttempts());
  if (lockedBefore) throw new SessionError('LOCKED', { lockedUntil: lockedBefore });

  const stored = await readSecret(key);
  if (!stored) throw new SessionError('PIN_NOT_SET');
  const isCorrect = await verifySecret(candidate, stored);

  const outcome = await db.transaction('rw', db.settings, async (): Promise<SessionError | null> => {
    const attempts = await readAttempts();
    const lockedNow = activeLock(attempts);
    if (lockedNow) return new SessionError('LOCKED', { lockedUntil: lockedNow });

    if (isCorrect) {
      await db.settings.put({ key: 'pinAttempts', value: { failed: 0, lockedUntil: null } });
      return null;
    }

    const failed = attempts.failed + 1;
    if (failed >= MAX_FAILED_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
      await db.settings.put({ key: 'pinAttempts', value: { failed: 0, lockedUntil } });
      return new SessionError('LOCKED', { lockedUntil });
    }
    await db.settings.put({ key: 'pinAttempts', value: { failed, lockedUntil: null } });
    return new SessionError('WRONG_PIN', { remainingAttempts: MAX_FAILED_ATTEMPTS - failed });
  });
  if (outcome) throw outcome;
}
