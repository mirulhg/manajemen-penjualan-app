import { Tag } from 'lucide-react';
import type { Dispatch } from 'react';

import type { CartAction } from '../cart-reducer';
import type { CartViewLine } from '../cart-view';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type CartLineDiscountProps = {
  line: CartViewLine;
  dispatch: Dispatch<CartAction>;
};

export function CartLineDiscount({ line, dispatch }: CartLineDiscountProps) {
  const { product } = line;
  const discountError = line.discountInvalid
    ? 'Diskon harus berupa angka, misalnya 4.000.'
    : line.discountExceedsLine
      ? 'Diskon melebihi subtotal barang ini.'
      : null;

  return (
    <details>
      <summary className={buttonVariants({ variant: 'ghost', className: 'cursor-pointer' })}>
        <Tag aria-hidden="true" />
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
        onChange={(event) => dispatch({ type: 'setLineDiscount', productId: product.id, text: event.target.value })}
        className="mt-1"
      />
      {discountError && (
        <p id={`discount-error-${product.id}`} className="mt-1 text-sm text-destructive">
          {discountError}
        </p>
      )}
    </details>
  );
}
