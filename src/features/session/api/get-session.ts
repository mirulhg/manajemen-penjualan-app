import { db } from '../../../lib/db/database';
import { getCashierMode } from '../../../lib/db/settings';

export const SESSION_QUERY_KEY = ['session'] as const;

export type Session = {
  isCashierMode: boolean;
  hasPin: boolean;
};

export async function getSession(): Promise<Session> {
  const [isCashierMode, pinRow] = await Promise.all([getCashierMode(), db.settings.get('ownerPin')]);
  return { isCashierMode, hasPin: pinRow !== undefined };
}
