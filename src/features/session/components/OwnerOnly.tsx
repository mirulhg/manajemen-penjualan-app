import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { useSession } from '../session-context';
import { Button } from '@/components/ui/button';

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
      <p className="mt-2 text-muted-foreground">Keluar dari Mode Kasir dengan PIN untuk membukanya.</p>
      <Button asChild variant="outline" className="mt-4"><Link to="/keluar-mode-kasir">
        Keluar Mode Kasir
      </Link></Button>
    </section>
  );
}
