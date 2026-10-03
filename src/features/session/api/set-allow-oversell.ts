import { db } from '../../../lib/db/database';

export async function setAllowOversell(value: boolean): Promise<void> {
  await db.settings.put({ key: 'allowOversell', value });
}
