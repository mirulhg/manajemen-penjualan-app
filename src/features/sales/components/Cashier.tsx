import { useReducer, useRef } from 'react';
import type { FormEvent } from 'react';

import { useCreateSale } from '../api/use-create-sale';
import { cartReducer, initialCartState } from '../cart-reducer';
import type { CartAction } from '../cart-reducer';
import { getCartView, toCreateSaleInput } from '../cart-view';
import type { Product } from '../../stock';
import { CartLine } from './CartLine';
import { PaymentSection } from './PaymentSection';
import { ProductSearch } from './ProductSearch';
import { SaleSuccessPanel } from './SaleSuccessPanel';
import { SaleTotals } from './SaleTotals';
import { SubmitSection } from './SubmitSection';

type CashierProps = {
  products: Product[];
  allowOversell: boolean;
};

export function Cashier({ products, allowOversell }: CashierProps) {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  const mutation = useCreateSale();
  const searchRef = useRef<HTMLInputElement>(null);
  const view = getCartView(cart, products, allowOversell);

  // Mengubah keranjang menutup panel sukses atau pesan gagal sebelumnya, supaya tidak menyesatkan.
  function handleCartAction(action: CartAction) {
    if (mutation.isSuccess || mutation.isError) mutation.reset();
    dispatch(action);
  }

  function handlePick(product: Product) {
    handleCartAction({ type: 'add', productId: product.id, price: product.sellingPrice });
  }

  function handleNewSale() {
    mutation.reset();
    searchRef.current?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (view.blockReason !== null) return;
    try {
      await mutation.mutateAsync(toCreateSaleInput(cart, view));
      // Keranjang dikosongkan hanya setelah penyimpanan berhasil.
      dispatch({ type: 'clear' });
    } catch {
      // Kegagalan ditampilkan lewat mutation.error di SubmitSection; keranjang sengaja dibiarkan utuh.
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
      {mutation.isSuccess && <SaleSuccessPanel sale={mutation.data} onNewSale={handleNewSale} />}
      <ProductSearch products={products} inputRef={searchRef} onPick={handlePick} />
      {view.lines.length > 0 && (
        <ul aria-label="Keranjang" className="rounded-md border border-border bg-card">
          {view.lines.map((line) => (
            <CartLine key={line.product.id} line={line} dispatch={handleCartAction} />
          ))}
        </ul>
      )}
      <SaleTotals
        view={view}
        transactionDiscountText={cart.transactionDiscountText}
        dispatch={handleCartAction}
      />
      <PaymentSection
        paymentMethod={cart.paymentMethod}
        cashText={cart.cashText}
        view={view}
        dispatch={handleCartAction}
      />
      <SubmitSection
        blockReason={view.blockReason}
        isPending={mutation.isPending}
        error={mutation.error}
      />
    </form>
  );
}
