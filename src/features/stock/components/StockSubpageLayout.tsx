import type { ReactNode } from 'react';
import { Link } from 'react-router';

type StockSubpageLayoutProps = {
  title: string;
  heading: string;
  backTo: string;
  children: ReactNode;
};

export function StockSubpageLayout({ title, heading, backTo, children }: StockSubpageLayoutProps) {
  return (
    <section>
      <title>{`${title} · Manajemen Stok`}</title>
      <Link to={backTo} className="inline-flex min-h-11 items-center font-medium text-primary">
        Kembali ke daftar stok
      </Link>
      <h1 className="mb-4 text-xl font-semibold">{heading}</h1>
      {children}
    </section>
  );
}
