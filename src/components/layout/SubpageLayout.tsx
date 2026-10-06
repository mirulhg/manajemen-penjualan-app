import type { ReactNode } from 'react';
import { useLocation } from 'react-router';

import { BackButton } from './BackButton';

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
      <div className="mb-4 flex items-center gap-1">
        <BackButton to={backTo} label={backLabel} state={locationState} />
        <h1 className="text-xl font-semibold">{heading}</h1>
      </div>
      {children}
    </section>
  );
}
