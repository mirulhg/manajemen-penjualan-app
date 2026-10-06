import type { Dispatch, FormEvent } from 'react';

import type { CartAction, CartState } from '../cart-reducer';
import type { CartView } from '../cart-view';
import { PaymentSection } from './PaymentSection';
import { SaleTotals } from './SaleTotals';
import { SubmitSection } from './SubmitSection';

type PaymentPanelProps = {
  cart: CartState;
  view: CartView;
  dispatch: Dispatch<CartAction>;
  status: { isPending: boolean; error: Error | null };
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

// Form sendiri: di HP ia ada di dalam Drawer (di-portal ke luar halaman), di desktop di kolom kanan. Isinya sama.
export function PaymentPanel({ cart, view, dispatch, status, onSubmit }: PaymentPanelProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <SaleTotals view={view} transactionDiscountText={cart.transactionDiscountText} dispatch={dispatch} />
      <PaymentSection paymentMethod={cart.paymentMethod} cashText={cart.cashText} view={view} dispatch={dispatch} />
      <SubmitSection
        blockReason={view.blockReason}
        isBlockedByCash={view.isBlockedByCash}
        isPending={status.isPending}
        error={status.error}
      />
    </form>
  );
}
