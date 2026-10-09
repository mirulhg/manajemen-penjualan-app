import { Download, PackagePlus, PackageSearch, Upload } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { canCashierSeeAlerts, useSession } from '../../features/session';
import { CommandGroup, CommandItem } from '@/components/ui/command';
import { getVisiblePages, matchesQuery } from './palette-pages';
import { PaletteHelpGroup } from './PaletteHelpGroup';
import { PaletteProductGroup } from './PaletteProductGroup';

type PaletteRootItemsProps = {
  query: string;
  onNavigate: (to: string) => void;
  onStartRestock: () => void;
  onOpenHelp: (slug: string) => void;
  onDownloadLastMonthSales: () => void;
};

type PaletteAction = { label: string; icon: LucideIcon; keywords: string; run: () => void };

export function PaletteRootItems({ query, onNavigate, onStartRestock, onOpenHelp, onDownloadLastMonthSales }: PaletteRootItemsProps) {
  const session = useSession();
  const { isCashierMode } = session;
  const access = { isCashierMode, canCashierSeeAlerts: canCashierSeeAlerts(session) };
  const pages = getVisiblePages(access).filter((page) =>
    matchesQuery(query, page.label, page.keywords),
  );

  const actions: PaletteAction[] = isCashierMode
    ? []
    : [
        { label: 'Tambah barang', icon: PackagePlus, keywords: 'baru produk', run: () => onNavigate('/stok/baru') },
        { label: 'Impor barang', icon: Upload, keywords: 'excel csv file', run: () => onNavigate('/stok/impor') },
        { label: 'Barang masuk…', icon: PackageSearch, keywords: 'restock tambah stok sesuaikan', run: onStartRestock },
        { label: 'Unduh laporan penjualan bulan lalu', icon: Download, keywords: 'csv omzet', run: onDownloadLastMonthSales },
      ].filter((action) => matchesQuery(query, action.label, action.keywords));

  return (
    <>
      {pages.length > 0 && (
        <CommandGroup heading="Halaman">
          {pages.map((page) => (
            <CommandItem key={page.to} value={page.to} onSelect={() => onNavigate(page.to)} className="min-h-11">
              <page.icon aria-hidden="true" />
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>
      )}
      {actions.length > 0 && (
        <CommandGroup heading="Aksi">
          {actions.map((action) => (
            <CommandItem key={action.label} value={action.label} onSelect={action.run} className="min-h-11">
              <action.icon aria-hidden="true" />
              {action.label}
            </CommandItem>
          ))}
        </CommandGroup>
      )}
      <PaletteHelpGroup query={query} access={access} onOpenHelp={onOpenHelp} />
      <PaletteProductGroup query={query} heading="Barang" mode="detail" onNavigate={onNavigate} />
    </>
  );
}
