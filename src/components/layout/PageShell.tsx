import type { ReactNode } from 'react';

type PageShellProps = {
  nav?: ReactNode;
  tabBar?: ReactNode;
  statusLabel?: string;
  children: ReactNode;
};

export function PageShell({ nav, tabBar, statusLabel, children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-sticky border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-2">
          <p className="text-lg font-semibold">Manajemen Stok</p>
          {statusLabel && <p className="rounded-md border border-border px-2 py-1 text-sm font-medium">{statusLabel}</p>}
          {nav}
        </div>
      </header>
      {/* pb-24 menyisakan ruang untuk TabBar (48px) beserta area aman layar HP; di layar lebar TabBar tidak ada. */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 md:pb-6">{children}</main>
      {tabBar}
    </div>
  );
}
