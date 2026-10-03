import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { useSession } from '../session-context';

type OwnerOnlyProps = {
  children: ReactNode;
};

export function OwnerOnly({ children }: OwnerOnlyProps) {
  const { isCashierMode } = useSession();

  if (!isCashierMode) return children;

  return (
    <section>
      <title>Khusus pemilik · Manajemen Stok</title>
      <h1 className="text-xl font-semibold">Halaman ini hanya untuk pemilik</h1>
      <p className="mt-2 text-text-muted">Keluar dari Mode Kasir dengan PIN untuk membukanya.</p>
      <Link to="/keluar-mode-kasir" className="mt-4 inline-flex min-h-11 items-center font-medium text-primary">
        Keluar Mode Kasir
      </Link>
    </section>
  );
}
