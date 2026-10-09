import { useState } from 'react';

import { SectionCard } from '../../../components/ui/SectionCard';
import { useSession } from '../session-context';
import { PinChangeForm } from './PinChangeForm';
import { PinRecoveryForm } from './PinRecoveryForm';
import { PinSetupForm } from './PinSetupForm';
import { RecoveryCodeNotice } from './RecoveryCodeNotice';
import { Button } from '@/components/ui/button';

export function PinSection() {
  const { hasPin } = useSession();
  // Kode pemulihan hanya ada di sini dan hilang setelah dicatat; tidak pernah disimpan dalam bentuk terbaca.
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  function handleDismiss() {
    setRecoveryCode(null);
  }

  function handleRecovered(newRecoveryCode: string) {
    setRecoveryCode(newRecoveryCode);
    setIsRecovering(false);
  }

  function handleStartRecovery() {
    setIsRecovering(true);
  }

  function handleCancelRecovery() {
    setIsRecovering(false);
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
      ) : !hasPin ? (
        <PinSetupForm onCreated={setRecoveryCode} />
      ) : isRecovering ? (
        <PinRecoveryForm onRecovered={handleRecovered} onCancel={handleCancelRecovery} />
      ) : (
        <>
          <PinChangeForm />
          <Button variant="ghost" type="button" onClick={handleStartRecovery}>
            Lupa PIN?
          </Button>
        </>
      )}
    </SectionCard>
  );
}
