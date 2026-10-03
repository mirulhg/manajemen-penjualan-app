import type { ReactNode } from 'react';

type PageShellProps = {
  nav?: ReactNode;
  children: ReactNode;
};

export function PageShell({ nav, children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-sticky border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-2">
          <p className="text-lg font-semibold">Manajemen Stok</p>
          {nav}
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
