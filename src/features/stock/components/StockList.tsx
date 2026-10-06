import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useState } from 'react';

import type { Product } from '../schema';
import { StockListItem } from './StockListItem';

type StockListProps = {
  products: Product[];
};

const ESTIMATED_ROW_HEIGHT = 76;
const OVERSCAN_ROWS = 8;

export function StockList({ products }: StockListProps) {
  // Posisi daftar di halaman (di bawah judul dan filter), dibaca saat elemen terpasang. Selisih kecil karena tata letak berubah masih tertutup overscan.
  const [scrollMargin, setScrollMargin] = useState(0);
  const virtualizer = useWindowVirtualizer({
    count: products.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: OVERSCAN_ROWS,
    scrollMargin,
  });

  return (
    <div className="rounded-md border border-border bg-card">
      {/* Header kolom hanya di md ke atas; dekoratif karena tiap baris sudah memuat teks lengkap untuk pembaca layar. */}
      <div
        aria-hidden="true"
        className="hidden grid-cols-12 border-b border-border px-4 py-2 text-sm font-medium text-muted-foreground md:grid"
      >
        <span className="col-span-5">Nama</span>
        <span className="col-span-3">Kategori</span>
        <span className="col-span-2 text-right">Stok</span>
        <span className="col-span-2 pl-4">Status</span>
      </div>
      <ul
        ref={(element) => {
          if (element) setScrollMargin(element.offsetTop);
        }}
        className="relative"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((row) => {
          const product = products[row.index];
          if (!product) return null;

          return (
            <li
              key={product.id}
              ref={virtualizer.measureElement}
              data-index={row.index}
              aria-setsize={products.length}
              aria-posinset={row.index + 1}
              className="absolute left-0 top-0 w-full border-b border-border"
              style={{ transform: `translateY(${row.start - scrollMargin}px)` }}
            >
              <StockListItem product={product} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
