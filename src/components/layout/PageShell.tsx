import type { ReactNode } from 'react';

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-sticky border-b border-border bg-surface">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <p className="text-lg font-semibold">Manajemen Stok</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
