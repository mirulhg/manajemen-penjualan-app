import { ShoppingCart } from 'lucide-react';
import type { Dispatch } from 'react';

import { EmptyState } from '../../../components/ui/EmptyState';
import type { CartAction } from '../cart-reducer';
import type { CartViewLine } from '../cart-view';
import { CartLine } from './CartLine';

type CartListProps = {
  lines: CartViewLine[];
  dispatch: Dispatch<CartAction>;
};

export function CartList({ lines, dispatch }: CartListProps) {
  if (lines.length === 0) {
    return <EmptyState icon={ShoppingCart} title="Keranjang masih kosong" description="Cari barang di kolom atas" />;
  }

  return (
    <ul aria-label="Keranjang" className="rounded-md border border-border bg-card">
      {lines.map((line) => (
        <CartLine key={line.product.id} line={line} dispatch={dispatch} />
      ))}
    </ul>
  );
}
