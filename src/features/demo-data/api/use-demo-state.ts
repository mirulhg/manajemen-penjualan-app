import { useQuery } from '@tanstack/react-query';

import { db } from '../../../lib/db/database';
import { isDemoPinStillActive } from '../clear-demo-data';
import { DEMO_PIN } from '../demo-tables';

export const DEMO_STATE_QUERY_KEY = ['demo-state'] as const;

type DemoState = {
  // Belum ada barang dan belum ada transaksi: satu-satunya keadaan di mana data contoh boleh dimuat.
  isEmpty: boolean;
  isDemo: boolean;
  // Hanya terisi bila PIN contoh masih berlaku (pemilik belum menggantinya).
  demoPin: string | null;
};

async function getDemoState(): Promise<DemoState> {
  const [productCount, saleCount, isDemoSetting] = await Promise.all([
    db.products.count(),
    db.sales.count(),
    db.settings.get('isDemo'),
  ]);
  const isDemo = isDemoSetting?.value === true;
  return {
    isEmpty: productCount === 0 && saleCount === 0,
    isDemo,
    demoPin: isDemo && (await isDemoPinStillActive()) ? DEMO_PIN : null,
  };
}

export function useDemoState() {
  return useQuery({ queryKey: DEMO_STATE_QUERY_KEY, queryFn: getDemoState });
}
