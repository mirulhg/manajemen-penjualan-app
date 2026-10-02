import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

type StockSubpageLayoutProps = {
  title: string;
  heading: string;
  backTo: string;
  backLabel: string;
  children: ReactNode;
};

export function StockSubpageLayout({ title, heading, backTo, backLabel, children }: StockSubpageLayoutProps) {
  const locationState: unknown = useLocation().state;

  return (
    <section>
      <title>{`${title} · Manajemen Stok`}</title>
      {/* state diteruskan agar filter dan urutan daftar stok bertahan di sepanjang rantai halaman. */}
      <Link to={backTo} state={locationState} className="inline-flex min-h-11 items-center font-medium text-primary">
        {backLabel}
      </Link>
      <h1 className="mb-4 text-xl font-semibold">{heading}</h1>
      {children}
    </section>
  );
}
