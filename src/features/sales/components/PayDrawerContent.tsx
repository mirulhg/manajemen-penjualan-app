import { useRef } from 'react';
import type { Dispatch, FormEvent } from 'react';

import type { CartAction, CartState } from '../cart-reducer';
import type { CartView } from '../cart-view';
import { PaymentPanel } from './PaymentPanel';
import { DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

type PayDrawerContentProps = {
  // Setelah simpan sukses fokus dipindah ke "Transaksi baru"; fokus tidak boleh dikembalikan ke tombol Bayar yang sudah nonaktif.
  isSaved: boolean;
  panel: {
    cart: CartState;
    view: CartView;
    dispatch: Dispatch<CartAction>;
    status: { isPending: boolean; error: Error | null };
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  };
};

// Dirender di dalam <Drawer> milik Cashier, bersama PayBar yang memuat DrawerTrigger (Radix mengembalikan fokus ke trigger saat menutup).
export function PayDrawerContent({ isSaved, panel }: PayDrawerContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  function handleOpenAutoFocus(event: Event) {
    // Tunai: kolom Uang diterima; non-tunai: tombol Simpan (elemen pertama bertanda data-autofocus).
    event.preventDefault();
    contentRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
  }

  function handleCloseAutoFocus(event: Event) {
    if (isSaved) event.preventDefault();
  }

  return (
    <DrawerContent ref={contentRef} onOpenAutoFocus={handleOpenAutoFocus} onCloseAutoFocus={handleCloseAutoFocus}>
      <DrawerHeader>
        <DrawerTitle>Pembayaran</DrawerTitle>
        <DrawerDescription className="sr-only">Atur diskon dan metode bayar, lalu simpan transaksi.</DrawerDescription>
      </DrawerHeader>
      <div className="overflow-y-auto pb-safe">
        <div className="px-4 pb-6">
          <PaymentPanel {...panel} />
        </div>
      </div>
    </DrawerContent>
  );
}
