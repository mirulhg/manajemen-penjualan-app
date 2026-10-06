import { AnimatePresence, m } from 'motion/react';
import type { ReactNode } from 'react';

import { useMediaQuery } from '../../hooks/use-media-query';
import { listItemMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type TableColumn<Row> = {
  header: string;
  align?: 'left' | 'right';
  cell: (row: Row) => ReactNode;
};

// Daftar ringkas untuk HP: judul di kiri, angka kunci di kanan, angka pendukung di baris kedua.
type MobileSummary<Row> = {
  title: (row: Row) => ReactNode;
  value: (row: Row) => string;
  detail: (row: Row) => string;
};

type ResponsiveTableProps<Row> = {
  caption: string;
  // Kolom pertama menjadi judul baris (<th scope="row">).
  columns: TableColumn<Row>[];
  rows: Row[];
  getKey: (row: Row) => string;
  summary: MobileSummary<Row>;
};

const TABLET_QUERY = '(min-width: 48rem)';

// md ke atas: tabel. Di bawah md: daftar ringkas. Cetak selalu tabel lengkap, di lebar layar berapa pun.
export function ResponsiveTable<Row>({ caption, columns, rows, getKey, summary }: ResponsiveTableProps<Row>) {
  const isTablet = useMediaQuery(TABLET_QUERY);

  return (
    <>
      <div className="hidden overflow-x-auto md:block print:block print:overflow-visible">
        <table className="w-full min-w-max text-sm print:min-w-0 print:text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-card">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.header}
                  scope="col"
                  className={cn('px-3 py-2 font-medium', index > 0 && column.align !== 'left' ? 'text-right' : 'text-left')}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={getKey(row)} className="border-t border-border print:break-inside-avoid">
                {columns.map((column, index) =>
                  index === 0 ? (
                    <th key={column.header} scope="row" className="px-3 py-2 text-left font-normal">
                      {column.cell(row)}
                    </th>
                  ) : (
                    <td key={column.header} className={cn('px-3 py-2', column.align !== 'left' && 'text-right')}>
                      {column.cell(row)}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!isTablet && (
        <ul aria-label={caption} className="relative divide-y divide-border rounded-md border border-border bg-card print:hidden">
          <AnimatePresence initial={false} mode="popLayout">
            {rows.map((row) => (
              <m.li key={getKey(row)} {...listItemMotion(rows.length)} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium">{summary.title(row)}</p>
                  <p className="text-sm text-muted-foreground">{summary.detail(row)}</p>
                </div>
                <p className="shrink-0 font-semibold">{summary.value(row)}</p>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </>
  );
}
