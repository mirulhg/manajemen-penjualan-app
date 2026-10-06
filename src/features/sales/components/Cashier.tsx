import { useReducer, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { useMediaQuery } from '../../../hooks/use-media-query';
import { useCreateSale } from '../api/use-create-sale';
import { cartReducer, initialCartState } from '../cart-reducer';
import type { CartAction } from '../cart-reducer';
import { getCartView, toCreateSaleInput } from '../cart-view';
import type { Product } from '../../stock';
import { CartList } from './CartList';
import { PayBar } from './PayBar';
import { PayDrawer } from './PayDrawer';
import { PaymentPanel } from './PaymentPanel';
import { ProductSearch } from './ProductSearch';
import { SaleSuccessPanel } from './SaleSuccessPanel';

type CashierProps = {
  products: Product[];
  allowOversell: boolean;
};

// Sama dengan breakpoint `lg` Tailwind: di bawahnya panel bayar jadi Drawer, di atasnya kolom kanan.
const DESKTOP_QUERY = '(min-width: 64rem)';

export function Cashier({ products, allowOversell }: CashierProps) {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const mutation = useCreateSale();
  const searchRef = useRef<HTMLInputElement>(null);
  const view = getCartView(cart, products, allowOversell);
  const hasItems = view.lines.length > 0;
  const itemCount = view.totals.itemCount;

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
      // Keranjang dikosongkan dan Drawer ditutup hanya setelah penyimpanan berhasil.
      dispatch({ type: 'clear' });
      setIsPayOpen(false);
    } catch {
      // Kegagalan ditampilkan lewat mutation.error di panel bayar; keranjang sengaja dibiarkan utuh.
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(event);
  }

  function handlePay() {
    setIsPayOpen(true);
  }

  const panel = {
    cart,
    view,
    dispatch: handleCartAction,
    status: { isPending: mutation.isPending, error: mutation.error },
    onSubmit: handleFormSubmit,
  };

  return (
    <div className={hasItems && !isDesktop ? 'space-y-4 pb-20' : 'space-y-4'}>
      {mutation.isSuccess && <SaleSuccessPanel sale={mutation.data} onNewSale={handleNewSale} />}
      <div className="space-y-4 lg:grid lg:grid-cols-3 lg:items-start lg:gap-6 lg:space-y-0">
        <div className="space-y-4 lg:col-span-2">
          <ProductSearch products={products} inputRef={searchRef} onPick={handlePick} />
          <CartList lines={view.lines} dispatch={handleCartAction} />
        </div>
        {isDesktop && (
          <aside aria-label="Pembayaran" className="sticky top-20 rounded-md border border-border bg-card p-4">
            <PaymentPanel {...panel} />
          </aside>
        )}
      </div>
      {!isDesktop && (
        <>
          <PayBar itemCount={itemCount} total={view.totals.total} isVisible={hasItems} onPay={handlePay} />
          <PayDrawer isOpen={isPayOpen} onOpenChange={setIsPayOpen} isSaved={mutation.isSuccess} panel={panel} />
        </>
      )}
    </div>
  );
}
