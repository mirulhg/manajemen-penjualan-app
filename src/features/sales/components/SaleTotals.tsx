import type { Dispatch } from 'react';

import { formatRupiah } from '../../../utils/format-rupiah';
import type { CartAction } from '../cart-reducer';
import type { CartView } from '../cart-view';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SaleTotalsProps = {
  view: CartView;
  transactionDiscountText: string;
  dispatch: Dispatch<CartAction>;
};

export function SaleTotals({ view, transactionDiscountText, dispatch }: SaleTotalsProps) {
  const { totals } = view;
  const discountTotal = totals.itemDiscountTotal + totals.transactionDiscount;
  const discountError = view.transactionDiscountInvalid
    ? 'Diskon harus berupa angka, misalnya 2.000.'
    : totals.problems.transactionDiscountTooLarge
      ? 'Diskon transaksi melebihi subtotal setelah diskon barang.'
      : null;

  return (
    <div className="space-y-2 rounded-md border border-border bg-card p-4">
      <details>
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium text-primary">
          Diskon transaksi
        </summary>
        <Label htmlFor="transaction-discount">
          Diskon transaksi (Rp)
        </Label>
        <Input
          id="transaction-discount"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={transactionDiscountText}
          aria-invalid={discountError ? true : undefined}
          aria-describedby={discountError ? 'transaction-discount-error' : undefined}
          onChange={(event) => dispatch({ type: 'setTransactionDiscount', text: event.target.value })}
          className="mt-1"
        />
        {discountError && (
          <p id="transaction-discount-error" className="mt-1 text-sm text-destructive">
            {discountError}
          </p>
        )}
      </details>
      <dl>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatRupiah(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Diskon</dt>
          <dd>{formatRupiah(discountTotal)}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="font-semibold">Total</dt>
          <dd className="text-2xl font-semibold">{formatRupiah(totals.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
