import { db } from './database';
import { settingSchema } from './records';

// Belum pernah diatur berarti jual melebihi stok ditolak (stok tidak boleh negatif tanpa izin pemilik).
export async function getAllowOversell(): Promise<boolean> {
  const row = await db.settings.get('allowOversell');
  return row ? settingSchema.parse(row).value : false;
}
