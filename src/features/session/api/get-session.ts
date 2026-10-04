import { db } from '../../../lib/db/database';
import { getCashierMode, getDefaultMinStock } from '../../../lib/db/settings';

export const SESSION_QUERY_KEY = ['session'] as const;

export type Session = {
  isCashierMode: boolean;
  hasPin: boolean;
  // Batas "menipis" bagi barang tanpa batas sendiri; semua tampilan status stok memakai nilai yang sama ini.
  defaultMinStock: number;
};

export async function getSession(): Promise<Session> {
  const [isCashierMode, pinRow, defaultMinStock] = await Promise.all([
    getCashierMode(),
    db.settings.get('ownerPin'),
    getDefaultMinStock(),
  ]);
  return { isCashierMode, hasPin: pinRow !== undefined, defaultMinStock };
}
