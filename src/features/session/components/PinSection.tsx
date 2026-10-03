import { useState } from 'react';

import { useSession } from '../session-context';
import { PinChangeForm } from './PinChangeForm';
import { PinSetupForm } from './PinSetupForm';
import { RecoveryCodeNotice } from './RecoveryCodeNotice';

export function PinSection() {
  const { hasPin } = useSession();
  // Kode pemulihan hanya ada di sini dan hilang setelah dicatat; tidak pernah disimpan dalam bentuk terbaca.
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  function handleDismiss() {
    setRecoveryCode(null);
  }

  return (
    <section aria-labelledby="pin-heading" className="space-y-3">
      <h2 id="pin-heading" className="text-lg font-semibold">
        PIN pemilik
      </h2>
      {recoveryCode ? (
        <RecoveryCodeNotice code={recoveryCode}>
          <button
            type="button"
            onClick={handleDismiss}
            className="min-h-11 rounded-md bg-primary px-4 font-medium text-on-primary"
          >
            Sudah saya catat
          </button>
        </RecoveryCodeNotice>
      ) : hasPin ? (
        <PinChangeForm />
      ) : (
        <PinSetupForm onCreated={setRecoveryCode} />
      )}
    </section>
  );
}
