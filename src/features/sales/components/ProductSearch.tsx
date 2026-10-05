import { useState } from 'react';
import type { RefObject } from 'react';

import { FIELD_CLASS, LABEL_CLASS } from '../../../components/ui/field-styles';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import { filterProducts, sortProducts, useStockThreshold } from '../../stock';
import type { Product } from '../../stock';

type ProductSearchProps = {
  products: Product[];
  inputRef: RefObject<HTMLInputElement | null>;
  onPick: (product: Product) => void;
};

const MAX_RESULTS = 20;

export function ProductSearch({ products, inputRef, onPick }: ProductSearchProps) {
  // Teks pencarian kasir bersifat sementara (hilang bersama keranjang saat refresh), jadi tidak dimasukkan ke URL.
  const [query, setQuery] = useState('');
  const defaultMinStock = useStockThreshold();
  const hasQuery = query.trim() !== '';
  const results = hasQuery
    ? sortProducts(
        filterProducts(products, { query, category: null, status: null, sort: 'nama', archived: false }, defaultMinStock),
        'nama',
      ).slice(0, MAX_RESULTS)
    : [];

  function handlePick(product: Product) {
    onPick(product);
    // Fokus kembali ke pencarian dan teks diblok, supaya mengetik berikutnya langsung mengganti kata kunci.
    inputRef.current?.focus();
    inputRef.current?.select();
  }

  return (
    <div>
      <label htmlFor="cashier-search" className={LABEL_CLASS}>
        Cari barang
      </label>
      <input
        id="cashier-search"
        ref={inputRef}
        type="search"
        autoComplete="off"
        placeholder="Nama atau SKU"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className={FIELD_CLASS}
      />
      {hasQuery && results.length === 0 && (
        <p className="mt-2 text-muted-foreground">Tidak ada barang yang cocok.</p>
      )}
      <ul className="mt-2 space-y-2">
        {results.map((product) => (
          <li key={product.id}>
            <button
              type="button"
              onClick={() => handlePick(product)}
              className="min-h-11 w-full rounded-md border border-border bg-card px-3 py-2 text-left"
            >
              <span className="block font-medium">{product.name}</span>
              <span className="block text-sm text-muted-foreground">
                {product.sku} · {formatRupiah(product.sellingPrice)} · Stok{' '}
                {formatNumber(Math.max(0, product.stockQuantity))} {product.unit}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
