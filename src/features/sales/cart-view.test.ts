import { describe, expect, it } from 'vitest';

import { SEED_AS_PRODUCTS } from '../../test/seed-products';
import { cartReducer, initialCartState } from './cart-reducer';
import type { CartAction } from './cart-reducer';
import { getCartView, toCreateSaleInput } from './cart-view';

function idOf(sku: string): string {
  const product = SEED_AS_PRODUCTS.find((item) => item.sku === sku);
  if (!product) throw new Error(`${sku} tidak ada di seed`);
  return product.id;
}

function add(sku: string): CartAction {
  const product = SEED_AS_PRODUCTS.find((item) => item.sku === sku);
  if (!product) throw new Error(`${sku} tidak ada di seed`);
  return { type: 'add', productId: product.id, price: product.sellingPrice };
}

function view(actions: CartAction[], allowOversell = false) {
  const cart = actions.reduce(cartReducer, initialCartState);
  return { cart, view: getCartView(cart, SEED_AS_PRODUCTS, allowOversell) };
}

describe('getCartView', () => {
  it('keranjang kosong: tombol simpan diblokir dengan alasan', () => {
    expect(view([]).view.blockReason).toBe('Keranjang masih kosong.');
  });

  it('tunai dengan uang kurang menyebut kekurangannya', () => {
    const { view: result } = view([
      add('SBK-001'),
      { type: 'setCash', text: '50.000' },
    ]);
    expect(result.cash.shortfall).toBe(24000);
    expect(result.blockReason).toBe('Uang diterima kurang Rp 24.000.');
  });

  it('uang pas membuka blokir dan kembalian dihitung dari uang diterima', () => {
    const { view: result } = view([
      add('SBK-001'),
      { type: 'setCash', text: '100.000' },
    ]);
    expect(result.blockReason).toBeNull();
    expect(result.cash.change).toBe(26000);
  });

  it('transfer tidak butuh uang diterima', () => {
    const { view: result } = view([
      add('SBK-001'),
      { type: 'setPaymentMethod', method: 'transfer' },
    ]);
    expect(result.blockReason).toBeNull();
  });

  it('barang melebihi stok memblokir kecuali pemilik mengizinkan', () => {
    const actions: CartAction[] = [
      add('SBK-005'),
      { type: 'setPaymentMethod', method: 'transfer' },
    ];
    expect(view(actions).view.blockReason).toBe('Ada barang yang melebihi stok.');
    const allowed = view(actions, true).view;
    expect(allowed.blockReason).toBeNull();
    expect(allowed.lines[0]?.exceedsStock).toBe(true);
  });

  it('diskon bukan angka atau melebihi nilai barang diblokir', () => {
    const base: CartAction[] = [
      add('MNM-001'),
      { type: 'setPaymentMethod', method: 'transfer' },
    ];
    const notNumber = view([...base, { type: 'setLineDiscount', productId: idOf('MNM-001'), text: 'abc' }]);
    expect(notNumber.view.blockReason).toBe('Isi diskon dengan angka, misalnya 4.000.');
    const tooBig = view([...base, { type: 'setLineDiscount', productId: idOf('MNM-001'), text: '4.000' }]);
    expect(tooBig.view.blockReason).toBe('Diskon melebihi nilai barang.');
  });

  it('input createSale memakai total di layar sebagai expectedTotal dan tidak membawa harga beli', () => {
    const { cart, view: result } = view([
      add('SBK-001'),
      { type: 'setCash', text: '100000' },
    ]);
    const input = toCreateSaleInput(cart, result);
    expect(input.expectedTotal).toBe(74000);
    expect(input.amountPaid).toBe(100000);
    expect(JSON.stringify(input)).not.toContain('68000');
  });
});
