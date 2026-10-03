import type { Product } from '../../lib/db/records';
import { formatRupiah } from '../../utils/format-rupiah';
import { parseRupiah } from '../../utils/parse-rupiah';
import { calculateSaleTotals, hasDiscountProblems } from './calculate-sale-totals';
import type { SaleTotals } from './calculate-sale-totals';
import type { CartState } from './cart-reducer';
import type { CreateSaleInput } from './schema';

export type CartViewLine = {
  product: Product;
  quantity: number;
  discountText: string;
  discountInvalid: boolean;
  discountExceedsLine: boolean;
  lineTotal: number;
  exceedsStock: boolean;
  available: number;
};

export type CartView = {
  lines: CartViewLine[];
  totals: SaleTotals;
  transactionDiscountInvalid: boolean;
  cash: { amount: number; invalid: boolean; change: number; shortfall: number };
  blockReason: string | null;
};

// Teks kosong berarti 0; teks yang bukan angka Rupiah valid menghasilkan null.
function parseMoneyText(text: string): number | null {
  return text.trim() === '' ? 0 : parseRupiah(text);
}

function getBlockReason(view: Omit<CartView, 'blockReason'>, cart: CartState, allowOversell: boolean) {
  if (view.lines.length === 0) return 'Keranjang masih kosong.';
  if (view.transactionDiscountInvalid || view.lines.some((line) => line.discountInvalid)) {
    return 'Isi diskon dengan angka, misalnya 4.000.';
  }
  if (hasDiscountProblems(view.totals)) return 'Diskon melebihi nilai barang.';
  if (!allowOversell && view.lines.some((line) => line.exceedsStock)) {
    return 'Ada barang yang melebihi stok.';
  }
  if (cart.paymentMethod === 'tunai') {
    if (view.cash.invalid) return 'Isi uang diterima dengan angka.';
    if (view.cash.shortfall > 0) return `Uang diterima kurang ${formatRupiah(view.cash.shortfall)}.`;
  }
  return null;
}

// Satu sumber turunan untuk layar kasir: tidak ada yang disalin ke state, semuanya dihitung dari keranjang dan produk.
export function getCartView(cart: CartState, products: Product[], allowOversell: boolean): CartView {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const lines = cart.lines.flatMap((line) => {
    const product = productsById.get(line.productId);
    if (!product) return [];
    const parsedDiscount = parseMoneyText(line.discountText);
    const discount = parsedDiscount ?? 0;
    const lineSubtotal = line.quantity * product.sellingPrice;
    return [
      {
        product,
        quantity: line.quantity,
        discountText: line.discountText,
        discountInvalid: parsedDiscount === null,
        discountExceedsLine: discount > lineSubtotal,
        lineTotal: Math.max(0, lineSubtotal - discount),
        exceedsStock: line.quantity > product.stockQuantity,
        available: Math.max(0, product.stockQuantity),
      },
    ];
  });

  const parsedTransactionDiscount = parseMoneyText(cart.transactionDiscountText);
  const totals = calculateSaleTotals(
    lines.map((line) => ({
      quantity: line.quantity,
      unitPrice: line.product.sellingPrice,
      discount: parseMoneyText(line.discountText) ?? 0,
    })),
    parsedTransactionDiscount ?? 0,
  );
  const parsedCash = parseMoneyText(cart.cashText);
  const cashAmount = parsedCash ?? 0;
  const partial = {
    lines,
    totals,
    transactionDiscountInvalid: parsedTransactionDiscount === null,
    cash: {
      amount: cashAmount,
      invalid: parsedCash === null,
      change: Math.max(0, cashAmount - totals.total),
      shortfall: Math.max(0, totals.total - cashAmount),
    },
  };
  return { ...partial, blockReason: getBlockReason(partial, cart, allowOversell) };
}

export function toCreateSaleInput(cart: CartState, view: CartView): CreateSaleInput {
  return {
    items: view.lines.map((line) => ({
      productId: line.product.id,
      quantity: line.quantity,
      discount: parseMoneyText(line.discountText) ?? 0,
    })),
    paymentMethod: cart.paymentMethod,
    transactionDiscount: view.totals.transactionDiscount,
    amountPaid: cart.paymentMethod === 'tunai' ? view.cash.amount : undefined,
    expectedTotal: view.totals.total,
  };
}
