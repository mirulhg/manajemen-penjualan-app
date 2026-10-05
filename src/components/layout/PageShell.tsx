import type { ReactNode } from 'react';

type PageShellProps = {
  // Nama toko dan penanda mode; diisi dari app/ supaya layout tidak tahu soal profil toko.
  brand: ReactNode;
  nav?: ReactNode;
  bell?: ReactNode;
  tabBar?: ReactNode;
  children: ReactNode;
};

export function PageShell({ brand, nav, bell, tabBar, children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-sticky border-b border-border bg-card print:hidden">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-2">
          <div className="flex min-w-0 items-center gap-2">{brand}</div>
          <div className="flex items-center gap-2">
            {nav}
            {bell}
          </div>
        </div>
      </header>
      {/* pb-24 menyisakan ruang untuk TabBar (56px) beserta area aman layar HP; di layar lebar TabBar tidak ada. */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 md:pb-6">{children}</main>
      {tabBar}
    </div>
  );
}
