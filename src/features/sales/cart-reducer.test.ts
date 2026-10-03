import { describe, expect, it } from 'vitest';

import { cartReducer, initialCartState, MAX_LINE_QUANTITY } from './cart-reducer';
import type { CartAction, CartState } from './cart-reducer';

function run(actions: CartAction[], start: CartState = initialCartState): CartState {
  return actions.reduce(cartReducer, start);
}

describe('cartReducer', () => {
  it('add menambah baris baru dengan jumlah 1', () => {
    expect(run([{ type: 'add', productId: 'a', price: 1000 }]).lines).toEqual([
      { productId: 'a', quantity: 1, discountText: '', priceAtAdd: 1000 },
    ]);
  });

  it('add pada barang yang sudah ada menambah jumlahnya', () => {
    const state = run([
      { type: 'add', productId: 'a', price: 1000 },
      { type: 'add', productId: 'a', price: 1000 },
    ]);
    expect(state.lines).toHaveLength(1);
    expect(state.lines[0]?.quantity).toBe(2);
  });

  it('decrease tidak turun di bawah 1', () => {
    const state = run([
      { type: 'add', productId: 'a', price: 1000 },
      { type: 'decrease', productId: 'a', price: 1000 },
    ]);
    expect(state.lines[0]?.quantity).toBe(1);
  });

  it('setQuantity dibatasi 1 sampai batas atas dan dibulatkan', () => {
    const setTo = (quantity: number) =>
      run([{ type: 'add', productId: 'a', price: 1000 }, { type: 'setQuantity', productId: 'a', quantity, price: 1000 }]).lines[0]
        ?.quantity;
    expect(setTo(0)).toBe(1);
    expect(setTo(7.9)).toBe(7);
    expect(setTo(MAX_LINE_QUANTITY + 5)).toBe(MAX_LINE_QUANTITY);
  });

  it('remove menghapus hanya baris itu', () => {
    const state = run([
      { type: 'add', productId: 'a', price: 1000 },
      { type: 'add', productId: 'b', price: 1000 },
      { type: 'remove', productId: 'a' },
    ]);
    expect(state.lines.map((line) => line.productId)).toEqual(['b']);
  });

  it('menyimpan diskon baris, diskon transaksi, metode bayar, dan uang diterima', () => {
    const state = run([
      { type: 'add', productId: 'a', price: 1000 },
      { type: 'setLineDiscount', productId: 'a', text: '4.000' },
      { type: 'setTransactionDiscount', text: '2.000' },
      { type: 'setPaymentMethod', method: 'qris' },
      { type: 'setCash', text: '200000' },
    ]);
    expect(state.lines[0]?.discountText).toBe('4.000');
    expect(state).toMatchObject({
      transactionDiscountText: '2.000',
      paymentMethod: 'qris',
      cashText: '200000',
    });
  });

  it('clear mengembalikan keadaan awal', () => {
    const state = run([
      { type: 'add', productId: 'a', price: 1000 },
      { type: 'setPaymentMethod', method: 'transfer' },
      { type: 'clear' },
    ]);
    expect(state).toEqual(initialCartState);
  });

  it('tidak mengubah state sebelumnya', () => {
    const before = run([{ type: 'add', productId: 'a', price: 1000 }]);
    const snapshot = structuredClone(before);
    cartReducer(before, { type: 'increase', productId: 'a', price: 1000 });
    expect(before).toEqual(snapshot);
  });
});
