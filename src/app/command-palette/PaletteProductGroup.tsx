import { filterProducts, getStockStatus, sortProducts, StockStatusBadge, useProducts, useStockThreshold } from '../../features/stock';
import type { Product } from '../../features/stock';
import { formatNumber } from '../../utils/format-number';
import { CommandGroup, CommandItem } from '@/components/ui/command';

type PaletteProductGroupProps = {
  query: string;
  heading: string;
  // detail: hasil mencari barang (boleh arsip, ada "Lihat semua"); restock: langkah kedua "Barang masuk…" (hanya barang aktif).
  mode: 'detail' | 'restock';
  onNavigate: (to: string) => void;
};

const MAX_RESULTS = 8;
const MIN_ARCHIVED_QUERY_LENGTH = 2;

export function PaletteProductGroup({ query, heading, mode, onNavigate }: PaletteProductGroupProps) {
  const { data: products, error } = useProducts();
  const defaultMinStock = useStockThreshold();
  const trimmedQuery = query.trim();

  if (error) {
    return (
      <p role="alert" className="px-4 py-3 text-sm text-muted-foreground">
        Daftar barang gagal dibaca. Tutup palette lalu coba lagi.
      </p>
    );
  }
  if (!products || (mode === 'detail' && trimmedQuery === '')) return null;

  const includeArchived = mode === 'detail' && trimmedQuery.length >= MIN_ARCHIVED_QUERY_LENGTH;
  // Fungsi yang sama dengan daftar Stok, supaya kata cari yang sama memberi hasil yang sama.
  const matches = sortProducts(
    filterProducts(products, { query: trimmedQuery, category: null, status: null, sort: 'nama', archived: includeArchived }, defaultMinStock),
    'nama',
  );
  if (matches.length === 0) return null;

  const shownProducts = matches.slice(0, MAX_RESULTS);
  const hasMore = mode === 'detail' && matches.length > MAX_RESULTS;

  function getPath(product: Product) {
    return mode === 'detail' ? `/stok/${product.id}` : `/stok/${product.id}/sesuaikan`;
  }

  function handleSeeAll() {
    onNavigate(`/stok?${new URLSearchParams({ q: trimmedQuery }).toString()}`);
  }

  return (
    <CommandGroup heading={heading}>
      {shownProducts.map((product) => (
        <CommandItem key={product.id} value={product.id} onSelect={() => onNavigate(getPath(product))} className="min-h-11 justify-between gap-3">
          <span className="min-w-0">
            <span className="block truncate font-medium">
              {product.name}
              {product.archivedAt !== null && <span className="ml-2 text-sm font-normal text-muted-foreground">Diarsipkan</span>}
            </span>
            <span className="block text-sm text-muted-foreground">
              {product.sku} · {formatNumber(product.stockQuantity)} {product.unit}
            </span>
          </span>
          <StockStatusBadge status={getStockStatus(product.stockQuantity, product.minStock, defaultMinStock)} />
        </CommandItem>
      ))}
      {hasMore && (
        <CommandItem value="lihat-semua-di-stok" onSelect={handleSeeAll} className="min-h-11">
          Lihat semua di Stok
        </CommandItem>
      )}
    </CommandGroup>
  );
}
