import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { StoreLetterhead } from './StoreLetterhead';

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
        <Link to="/laporan" className="inline-flex min-h-11 items-center font-medium text-primary">
          Kembali ke daftar laporan
        </Link>
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
