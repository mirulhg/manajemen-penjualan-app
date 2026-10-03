import type { PaymentMethod } from '../../lib/db/records';

export type CartLine = {
  productId: string;
  quantity: number;
  discountText: string;
  // Harga jual saat kasir terakhir "melihat" baris ini; bila harga produk berubah sesudahnya, kasir diberi tahu.
  priceAtAdd: number;
};

// Diskon dan uang diterima disimpan sebagai teks mentah; diubah ke angka saat render (parseRupiah).
export type CartState = {
  lines: CartLine[];
  transactionDiscountText: string;
  paymentMethod: PaymentMethod;
  cashText: string;
};

export type CartAction =
  | { type: 'add'; productId: string; price: number }
  | { type: 'increase'; productId: string; price: number }
  | { type: 'decrease'; productId: string; price: number }
  | { type: 'setQuantity'; productId: string; quantity: number; price: number }
  | { type: 'remove'; productId: string }
  | { type: 'setLineDiscount'; productId: string; text: string }
  | { type: 'setTransactionDiscount'; text: string }
  | { type: 'setPaymentMethod'; method: PaymentMethod }
  | { type: 'setCash'; text: string }
  | { type: 'clear' };

export const MAX_LINE_QUANTITY = 100_000;

export const initialCartState: CartState = {
  lines: [],
  transactionDiscountText: '',
  paymentMethod: 'tunai',
  cashText: '',
};

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.trunc(quantity)));
}

function updateLine(state: CartState, productId: string, change: (line: CartLine) => CartLine): CartState {
  return {
    ...state,
    lines: state.lines.map((line) => (line.productId === productId ? change(line) : line)),
  };
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const exists = state.lines.some((line) => line.productId === action.productId);
      if (exists) {
        return updateLine(state, action.productId, (line) => ({
          ...line,
          quantity: clampQuantity(line.quantity + 1),
          priceAtAdd: action.price,
        }));
      }
      return {
        ...state,
        lines: [
          ...state.lines,
          { productId: action.productId, quantity: 1, discountText: '', priceAtAdd: action.price },
        ],
      };
    }
    // Mengubah jumlah dianggap kasir sudah melihat harga sekarang, jadi priceAtAdd disamakan dengan harga itu.
    case 'increase':
      return updateLine(state, action.productId, (line) => ({
        ...line,
        quantity: clampQuantity(line.quantity + 1),
        priceAtAdd: action.price,
      }));
    case 'decrease':
      return updateLine(state, action.productId, (line) => ({
        ...line,
        quantity: clampQuantity(line.quantity - 1),
        priceAtAdd: action.price,
      }));
    case 'setQuantity':
      return updateLine(state, action.productId, (line) => ({
        ...line,
        quantity: clampQuantity(action.quantity),
        priceAtAdd: action.price,
      }));
    case 'remove':
      return { ...state, lines: state.lines.filter((line) => line.productId !== action.productId) };
    case 'setLineDiscount':
      return updateLine(state, action.productId, (line) => ({ ...line, discountText: action.text }));
    case 'setTransactionDiscount':
      return { ...state, transactionDiscountText: action.text };
    case 'setPaymentMethod':
      return { ...state, paymentMethod: action.method };
    case 'setCash':
      return { ...state, cashText: action.text };
    case 'clear':
      return initialCartState;
  }
}
