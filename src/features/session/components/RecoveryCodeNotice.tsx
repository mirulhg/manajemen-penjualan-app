import type { ReactNode } from 'react';
import { Alert } from '@/components/ui/alert';

type RecoveryCodeNoticeProps = {
  code: string;
  children: ReactNode;
};

export function RecoveryCodeNotice({ code, children }: RecoveryCodeNoticeProps) {
  return (
    <Alert variant="success" role="status" className="space-y-3 p-4">
      <p className="font-medium">Kode pemulihan Anda</p>
      <p className="text-2xl font-semibold">{code}</p>
      <p>Catat kode ini. Kode hanya ditampilkan sekali. Kode dipakai bila Anda lupa PIN.</p>
      {children}
    </Alert>
  );
}
