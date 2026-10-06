import { useState } from 'react';

import { SectionCard } from '../../../components/ui/SectionCard';
import { useSession } from '../session-context';
import { PinChangeForm } from './PinChangeForm';
import { PinSetupForm } from './PinSetupForm';
import { RecoveryCodeNotice } from './RecoveryCodeNotice';
import { Button } from '@/components/ui/button';

export function PinSection() {
  const { hasPin } = useSession();
  // Kode pemulihan hanya ada di sini dan hilang setelah dicatat; tidak pernah disimpan dalam bentuk terbaca.
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  function handleDismiss() {
    setRecoveryCode(null);
  }

  return (
    <SectionCard
      id="pin-heading"
      title="PIN pemilik"
      description="PIN dipakai untuk keluar dari Mode Kasir. Simpan kode pemulihannya."
    >
      {recoveryCode ? (
        <RecoveryCodeNotice code={recoveryCode}>
          <Button size="lg" type="button" onClick={handleDismiss}>
            Sudah saya catat
          </Button>
        </RecoveryCodeNotice>
      ) : hasPin ? (
        <PinChangeForm />
      ) : (
        <PinSetupForm onCreated={setRecoveryCode} />
      )}
    </SectionCard>
  );
}
