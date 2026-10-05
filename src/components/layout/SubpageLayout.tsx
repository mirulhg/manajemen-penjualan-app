import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';

type SubpageLayoutProps = {
  title: string;
  heading: string;
  backTo: string;
  backLabel: string;
  children: ReactNode;
};

export function SubpageLayout({ title, heading, backTo, backLabel, children }: SubpageLayoutProps) {
  const locationState: unknown = useLocation().state;

  return (
    <section>
      <title>{`${title} · Manajemen Stok`}</title>
      {/* state diteruskan agar filter dan urutan daftar stok bertahan di sepanjang rantai halaman. */}
      <Button asChild variant="outline"><Link to={backTo} state={locationState}>
        {backLabel}
      </Link></Button>
      <h1 className="mb-4 text-xl font-semibold">{heading}</h1>
      {children}
    </section>
  );
}
