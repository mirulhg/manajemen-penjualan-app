import type { Dispatch } from 'react';

import { FIELD_CLASS, LABEL_CLASS } from '../../../components/ui/field-styles';
import type { PaymentMethod } from '../../../lib/db/records';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import { getCashSuggestions } from '../cash-suggestions';
import type { CartAction } from '../cart-reducer';
import type { CartView } from '../cart-view';

type PaymentSectionProps = {
  paymentMethod: PaymentMethod;
  cashText: string;
  view: CartView;
  dispatch: Dispatch<CartAction>;
};

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'tunai', label: 'Tunai' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'qris', label: 'QRIS' },
];

export function PaymentSection({ paymentMethod, cashText, view, dispatch }: PaymentSectionProps) {
  const { total } = view.totals;
  const suggestions = getCashSuggestions(total);

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Metode bayar</legend>
      <div className="flex gap-2">
        {METHODS.map((method) => (
          <label
            key={method.value}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-card px-3"
          >
            <input
              type="radio"
              name="payment-method"
              value={method.value}
              checked={paymentMethod === method.value}
              onChange={() => dispatch({ type: 'setPaymentMethod', method: method.value })}
            />
            {method.label}
          </label>
        ))}
      </div>
      {paymentMethod === 'tunai' ? (
        <div>
          <label htmlFor="cash-received" className={LABEL_CLASS}>
            Uang diterima
          </label>
          <input
            id="cash-received"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={cashText}
            onChange={(event) => dispatch({ type: 'setCash', text: event.target.value })}
            className={FIELD_CLASS}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => dispatch({ type: 'setCash', text: String(amount) })}
                className="min-h-11 rounded-md border border-border bg-card px-4 font-medium"
              >
                {amount === total ? 'Uang pas' : formatNumber(amount)}
              </button>
            ))}
          </div>
          {view.cash.shortfall > 0 ? (
            <p className="mt-2">Uang kurang {formatRupiah(view.cash.shortfall)}</p>
          ) : (
            <p className="mt-2 text-xl font-semibold">Kembalian {formatRupiah(view.cash.change)}</p>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">Dicatat pas sesuai total, tanpa kembalian.</p>
      )}
    </fieldset>
  );
}
