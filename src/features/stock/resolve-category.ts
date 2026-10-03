import { db } from '../../lib/db/database';
import { toCategoryKey } from '../../lib/db/records';

// Satu-satunya cara penyeragaman kategori untuk barang: pakai ejaan kategori yang sudah ada, atau buat baru.
// Harus dipanggil di dalam transaksi yang mencakup db.categories.
export async function resolveCategory(name: string, now: string): Promise<string> {
  const nameKey = toCategoryKey(name);
  const existing = await db.categories.where('nameKey').equals(nameKey).first();
  if (existing) return existing.name;

  await db.categories.add({ id: crypto.randomUUID(), name, nameKey, createdAt: now, updatedAt: now });
  return name;
}
