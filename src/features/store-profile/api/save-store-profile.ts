import { db } from '../../../lib/db/database';
import { storeProfileSchema } from '../../../lib/db/records';
import { getStoreProfile } from '../../../lib/db/settings';
import { storeProfileFormSchema } from '../schema';
import type { LogoDraft, StoreProfileFormInput } from '../schema';

export async function saveStoreProfile(input: StoreProfileFormInput, logoDraft: LogoDraft): Promise<void> {
  const values = storeProfileFormSchema.parse(input);
  // Dibaca di dalam transaksi: logo lama dipertahankan bila pemilik tidak menyentuhnya.
  await db.transaction('rw', db.settings, async () => {
    const currentLogo = (await getStoreProfile())?.logo ?? null;
    const logo = logoDraft.kind === 'replace' ? logoDraft.logo : logoDraft.kind === 'remove' ? null : currentLogo;
    await db.settings.put({ key: 'storeProfile', value: storeProfileSchema.parse({ ...values, logo }) });
  });
}
