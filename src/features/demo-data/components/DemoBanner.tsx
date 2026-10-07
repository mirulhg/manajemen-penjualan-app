import { FlaskConical } from 'lucide-react';

import { getEnv } from '../../../lib/env';
import { useSession } from '../../session';
import { useDemoState } from '../api/use-demo-state';
import { ClearDemoDataButton } from './ClearDemoDataButton';
import { Alert } from '@/components/ui/alert';

// Tampil di atas halaman pemilik (bukan Mode Kasir, dan AppLayout tidak memasangnya di Kasir).
export function DemoBanner() {
  const { isCashierMode } = useSession();
  const { data: state } = useDemoState();

  if (isCashierMode || !state) return null;

  if (state.isDemo) {
    return (
      <Alert role="status" className="mb-4 space-y-3">
        <FlaskConical aria-hidden="true" />
        <div className="space-y-3">
          <p className="font-medium">Data contoh</p>
          <p>
            Barang dan transaksi di aplikasi ini hanya contoh.
            {state.demoPin !== null && <> PIN Mode Kasir contoh: <strong>{state.demoPin}</strong>.</>}
          </p>
          <ClearDemoDataButton />
        </div>
      </Alert>
    );
  }

  if (state.isEmpty && getEnv().VITE_DEMO) {
    return (
      <Alert role="status" className="mb-4">
        <FlaskConical aria-hidden="true" />
        <div>
          <p className="font-medium">Mode demo</p>
          <p>Aplikasi masih kosong. Tekan “Muat data contoh” di Dasbor atau Pengaturan untuk mengisinya.</p>
        </div>
      </Alert>
    );
  }

  return null;
}
