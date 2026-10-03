import { db } from './database';
import { settingSchema } from './records';

// Belum pernah diatur berarti jual melebihi stok ditolak (stok tidak boleh negatif tanpa izin pemilik).
export async function getAllowOversell(): Promise<boolean> {
  const row = await db.settings.get('allowOversell');
  return row ? settingSchema.parse(row).value : false;
}

export const OWNER_ACTOR = 'Pemilik';
export const CASHIER_ACTOR = 'Kasir';

// Mode Kasir dibaca di dalam transaksi penulisan (db.settings harus ada di scope), supaya pelaku tidak salah walau mode berganti di tab lain.
export async function getCurrentActor(): Promise<string> {
  const row = await db.settings.get('cashierMode');
  return row && settingSchema.parse(row).value ? CASHIER_ACTOR : OWNER_ACTOR;
}
