import { HelpLink } from '../../help';
import { useState } from 'react';
import { Link, Navigate } from 'react-router';

import { useSession } from '../session-context';
import { ExitWithPinForm } from './ExitWithPinForm';
import { ExitWithRecoveryForm } from './ExitWithRecoveryForm';
import { RecoveryCodeNotice } from './RecoveryCodeNotice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ExitCashierModePage() {
  const { isCashierMode } = useSession();
  const [isUsingRecovery, setIsUsingRecovery] = useState(false);
  // Kode baru harus tetap tampil walau mode sudah berubah; hanya ada di sini sampai dicatat.
  const [newRecoveryCode, setNewRecoveryCode] = useState<string | null>(null);

  function handleToggleRecovery() {
    setIsUsingRecovery((current) => !current);
  }

  if (newRecoveryCode) {
    return (
      <section className="space-y-4">
        <title>PIN baru · Manajemen Stok</title>
        <h1 className="text-xl font-semibold">PIN diganti</h1>
        <RecoveryCodeNotice code={newRecoveryCode}>
          <Button asChild variant="outline"><Link to="/stok">
            Sudah saya catat, lanjut ke daftar stok
          </Link></Button>
        </RecoveryCodeNotice>
      </section>
    );
  }
  if (!isCashierMode) return <Navigate to="/stok" replace />;

  return (
    <section className="space-y-4">
      <title>Keluar Mode Kasir · Manajemen Stok</title>
      <div className="flex items-center gap-1">
        <h1 className="text-xl font-semibold">Keluar Mode Kasir</h1>
        <HelpLink topic="mode-kasir" />
      </div>
      <Card>
        <CardContent>
          {isUsingRecovery ? <ExitWithRecoveryForm onRecovered={setNewRecoveryCode} /> : <ExitWithPinForm />}
        </CardContent>
      </Card>
      <Button variant="link" type="button" onClick={handleToggleRecovery}>
        {isUsingRecovery ? 'Pakai PIN' : 'Pakai kode pemulihan'}
      </Button>
    </section>
  );
}
