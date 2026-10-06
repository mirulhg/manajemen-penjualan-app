import type { ReactNode } from 'react';

type PageShellProps = {
  // Nama toko dan penanda mode; diisi dari app/ supaya layout tidak tahu soal profil toko.
  brand: ReactNode;
  // Navigasi desktop dan lonceng; digabung satu slot agar prop tetap ≤ 5.
  actions?: ReactNode;
  tabBar?: ReactNode;
  // 'wide' melebar sampai lg untuk halaman dua kolom/tabel (Kasir, Stok, Riwayat).
  width?: 'default' | 'wide';
  children: ReactNode;
};

const WIDTH_CLASSES = { default: 'max-w-3xl', wide: 'max-w-3xl lg:max-w-5xl' } as const;

export function PageShell({ brand, actions, tabBar, width = 'default', children }: PageShellProps) {
  const widthClass = WIDTH_CLASSES[width];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-sticky border-b border-border bg-card print:hidden">
        <div className={`mx-auto flex w-full ${widthClass} items-center justify-between gap-4 px-4 py-2`}>
          <div className="flex min-w-0 items-center gap-2">{brand}</div>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      </header>
      {/* pb-24 menyisakan ruang untuk TabBar (56px) beserta area aman layar HP; di layar lebar TabBar tidak ada. */}
      <main className={`mx-auto w-full ${widthClass} flex-1 px-4 py-6 pb-24 md:pb-6`}>{children}</main>
      {tabBar}
    </div>
  );
}
