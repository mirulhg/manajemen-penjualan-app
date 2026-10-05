import type { Dispatch } from 'react';

import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { CartAction } from '../cart-reducer';
import type { CartViewLine } from '../cart-view';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

type CartLineProps = {
  line: CartViewLine;
  dispatch: Dispatch<CartAction>;
};

const STEP_BUTTON_CLASS = 'min-h-11 min-w-11 rounded-md border border-border bg-card font-medium';

export function CartLine({ line, dispatch }: CartLineProps) {
  const { product } = line;
  const discountError = line.discountInvalid
    ? 'Diskon harus berupa angka, misalnya 4.000.'
    : line.discountExceedsLine
      ? 'Diskon melebihi subtotal barang ini.'
      : null;

  function handleQuantityChange(text: string) {
    if (/^\d+$/.test(text)) {
      dispatch({ type: 'setQuantity', productId: product.id, quantity: Number(text), price: product.sellingPrice });
    }
  }

  return (
    <li className="space-y-2 border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-medium">{product.name}</p>
        <p className="shrink-0 font-medium">{formatRupiah(line.lineTotal)}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        {formatRupiah(product.sellingPrice)} per {product.unit}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Kurangi ${product.name}`}
          onClick={() => dispatch({ type: 'decrease', productId: product.id, price: product.sellingPrice })}
          className={STEP_BUTTON_CLASS}
        >
          −
        </button>
        <Input
          type="text"
          inputMode="numeric"
          aria-label={`Jumlah ${product.name}`}
          value={String(line.quantity)}
          onChange={(event) => handleQuantityChange(event.target.value)}
          className="w-20 text-center"
        />
        <button
          type="button"
          aria-label={`Tambah ${product.name}`}
          onClick={() => dispatch({ type: 'increase', productId: product.id, price: product.sellingPrice })}
          className={STEP_BUTTON_CLASS}
        >
          +
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'remove', productId: product.id })}
          className="ml-auto min-h-11 rounded-md border border-border bg-card px-3 font-medium"
        >
          Hapus
        </button>
      </div>
      {line.priceChangedFrom !== null && (
        <p aria-live="polite" className="rounded-md bg-status-menipis-bg p-2 text-sm text-status-menipis-text">
          Harga berubah dari {formatRupiah(line.priceChangedFrom)} ke {formatRupiah(product.sellingPrice)}
        </p>
      )}
      {line.isArchived && (
        <Alert variant="destructive" className="p-2 text-sm">
          Barang ini sudah diarsipkan dan tidak bisa dijual. Hapus dari keranjang untuk melanjutkan.
        </Alert>
      )}
      {line.exceedsStock && (
        <p className="text-sm text-destructive">
          Stok tidak cukup (tersedia {formatNumber(line.available)})
        </p>
      )}
      <details>
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium text-primary">
          Diskon
        </summary>
        <label className="text-sm font-medium" htmlFor={`discount-${product.id}`}>
          Diskon {product.name} (Rp)
        </label>
        <Input
          id={`discount-${product.id}`}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={line.discountText}
          aria-invalid={discountError ? true : undefined}
          aria-describedby={discountError ? `discount-error-${product.id}` : undefined}
          onChange={(event) =>
            dispatch({ type: 'setLineDiscount', productId: product.id, text: event.target.value })
          }
          className="mt-1"
        />
        {discountError && (
          <p id={`discount-error-${product.id}`} className="mt-1 text-sm text-destructive">
            {discountError}
          </p>
        )}
      </details>
    </li>
  );
}
