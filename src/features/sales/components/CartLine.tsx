import { Minus, Plus, Trash2 } from 'lucide-react';
import type { Dispatch } from 'react';

import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import type { CartAction } from '../cart-reducer';
import type { CartViewLine } from '../cart-view';
import { CartLineDiscount } from './CartLineDiscount';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type CartLineProps = {
  line: CartViewLine;
  dispatch: Dispatch<CartAction>;
};

export function CartLine({ line, dispatch }: CartLineProps) {
  const { product } = line;

  function handleQuantityChange(text: string) {
    if (/^\d+$/.test(text)) {
      dispatch({ type: 'setQuantity', productId: product.id, quantity: Number(text), price: product.sellingPrice });
    }
  }

  return (
    <li className="space-y-2 border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="line-clamp-2 font-medium">{product.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatRupiah(product.sellingPrice)} per {product.unit}
          </p>
        </div>
        <p className="shrink-0 font-medium">{formatRupiah(line.lineTotal)}</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center rounded-md border border-input bg-card">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Kurangi ${product.name}`}
            onClick={() => dispatch({ type: 'decrease', productId: product.id, price: product.sellingPrice })}
          >
            <Minus aria-hidden="true" />
          </Button>
          <Input
            type="text"
            inputMode="numeric"
            aria-label={`Jumlah ${product.name}`}
            value={String(line.quantity)}
            onChange={(event) => handleQuantityChange(event.target.value)}
            className="w-14 rounded-none border-0 px-1 text-center"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Tambah ${product.name}`}
            onClick={() => dispatch({ type: 'increase', productId: product.id, price: product.sellingPrice })}
          >
            <Plus aria-hidden="true" />
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Hapus ${product.name}`}
          onClick={() => dispatch({ type: 'remove', productId: product.id })}
        >
          <Trash2 aria-hidden="true" />
        </Button>
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
        <p className="text-sm text-destructive">Stok tidak cukup (tersedia {formatNumber(line.available)})</p>
      )}
      <CartLineDiscount line={line} dispatch={dispatch} />
    </li>
  );
}
