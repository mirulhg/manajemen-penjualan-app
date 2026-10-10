import { z } from 'zod';

import { db } from '@/lib/db/database';

const versionSchema = z.string();

export const CHANGELOG_SEEN_QUERY_KEY = ['settings', 'changelogSeenVersion'] as const;

export async function getSeenVersion(): Promise<string | null> {
  const row = await db.settings.get('changelogSeenVersion');
  return row ? versionSchema.parse(row.value) : null;
}

export async function markChangelogSeen(version: string): Promise<void> {
  await db.settings.put({ key: 'changelogSeenVersion', value: version });
}

// Menentukan apakah toast "Diperbarui ke versi" perlu tampil, lalu mencatat versi ini sebagai sudah diberitahukan.
// Pemasangan baru (belum ada kunci dan database kosong) tidak diberi tahu apa-apa: tidak ada versi lama untuk dibandingkan.
export async function shouldNotifyUpdate(version: string): Promise<boolean> {
  const [notified, seen] = await Promise.all([db.settings.get('notifiedVersion'), db.settings.get('changelogSeenVersion')]);
  if (notified?.value === version) return false;

  if (!notified && !seen) {
    const [productCount, saleCount] = await Promise.all([db.products.count(), db.sales.count()]);
    if (productCount === 0 && saleCount === 0) {
      await db.settings.bulkPut([
        { key: 'notifiedVersion', value: version },
        { key: 'changelogSeenVersion', value: version },
      ]);
      return false;
    }
  }

  await db.settings.put({ key: 'notifiedVersion', value: version });
  return true;
}
