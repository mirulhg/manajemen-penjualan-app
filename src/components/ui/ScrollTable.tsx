import type { ReactNode } from 'react';

type ScrollTableProps = {
  caption: string;
  children: ReactNode;
};

// Tabel lebar bergulir di dalam kotaknya sendiri, sehingga halaman tidak ikut bergulir ke samping di layar kecil.
export function ScrollTable({ caption, children }: ScrollTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-surface">
      <table className="w-full min-w-max text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}
