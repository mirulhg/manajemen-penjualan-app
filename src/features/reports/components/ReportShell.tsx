import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { StoreLetterhead } from './StoreLetterhead';
import { Button } from '@/components/ui/button';

type ReportShellProps = {
  title: string;
  // Filter dan aksi hanya tampil di layar; cetakan hanya berisi kop, judul, dan isi laporan.
  filters: ReactNode;
  actions: ReactNode;
  children: ReactNode;
};

export function ReportShell({ title, filters, actions, children }: ReportShellProps) {
  return (
    <section className="space-y-6">
      <title>{`${title} · Manajemen Stok`}</title>
      <div className="space-y-4 print:hidden">
        <Button asChild variant="ghost"><Link to="/laporan">
          Kembali ke daftar laporan
        </Link></Button>
        {filters}
        {actions}
      </div>
      <article className="space-y-6">
        <StoreLetterhead />
        <h1 className="text-xl font-semibold">{title}</h1>
        {children}
      </article>
    </section>
  );
}
