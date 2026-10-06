import { ShoppingCart } from 'lucide-react';
import type { Dispatch } from 'react';

import type { CartAction } from '../cart-reducer';
import type { CartViewLine } from '../cart-view';
import { CartLine } from './CartLine';

type CartListProps = {
  lines: CartViewLine[];
  dispatch: Dispatch<CartAction>;
};

export function CartList({ lines, dispatch }: CartListProps) {
  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border px-4 py-8 text-center">
        <ShoppingCart aria-hidden="true" className="size-8 text-muted-foreground" />
        <p className="font-medium">Keranjang masih kosong</p>
        <p className="text-sm text-muted-foreground">Cari barang di kolom atas</p>
      </div>
    );
  }

  return (
    <ul aria-label="Keranjang" className="rounded-md border border-border bg-card">
      {lines.map((line) => (
        <CartLine key={line.product.id} line={line} dispatch={dispatch} />
      ))}
    </ul>
  );
}
