import type { ReactNode } from 'react';

type RecoveryCodeNoticeProps = {
  code: string;
  children: ReactNode;
};

export function RecoveryCodeNotice({ code, children }: RecoveryCodeNoticeProps) {
  return (
    <div role="status" className="space-y-3 rounded-md bg-status-aman-bg p-4 text-status-aman-text">
      <p className="font-medium">Kode pemulihan Anda</p>
      <p className="text-2xl font-semibold">{code}</p>
      <p>Catat kode ini. Kode hanya ditampilkan sekali. Kode dipakai bila Anda lupa PIN.</p>
      {children}
    </div>
  );
}
