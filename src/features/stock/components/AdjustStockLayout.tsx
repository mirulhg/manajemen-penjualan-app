import type { ReactNode } from 'react';
import { Link } from 'react-router';

type AdjustStockLayoutProps = {
  title: string;
  backTo: string;
  children: ReactNode;
};

export function AdjustStockLayout({ title, backTo, children }: AdjustStockLayoutProps) {
  return (
    <section>
      <title>{`${title} · Manajemen Stok`}</title>
      <Link to={backTo} className="inline-flex min-h-11 items-center font-medium text-primary">
        Kembali ke daftar stok
      </Link>
      <h1 className="mb-4 text-xl font-semibold">Penyesuaian Stok</h1>
      {children}
    </section>
  );
}
