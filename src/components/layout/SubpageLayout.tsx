import type { ReactNode } from 'react';
import { useLocation } from 'react-router';

import { BackButton } from './BackButton';

type SubpageLayoutProps = {
  title: string;
  heading: string;
  back: { to: string; label: string };
  // Dirender tepat di kanan judul, misalnya tombol bantuan.
  action?: ReactNode;
  children: ReactNode;
};

export function SubpageLayout({ title, heading, back, action, children }: SubpageLayoutProps) {
  const locationState: unknown = useLocation().state;

  return (
    <section>
      <title>{`${title} · Manajemen Stok`}</title>
      {/* state diteruskan agar filter dan urutan daftar stok bertahan di sepanjang rantai halaman. */}
      <div className="mb-4 flex items-center gap-1">
        <BackButton to={back.to} label={back.label} state={locationState} />
        <h1 className="text-xl font-semibold">{heading}</h1>
        {action}
      </div>
      {children}
    </section>
  );
}
