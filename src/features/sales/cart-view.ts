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
  isArchived: boolean;
  // Harga saat barang dimasukkan/terakhir dilihat bila sekarang berbeda; null bila tidak berubah.
  priceChangedFrom: number | null;
};

export type CartView = {
  lines: CartViewLine[];
  totals: SaleTotals;
  transactionDiscountInvalid: boolean;
  cash: { amount: number; invalid: boolean; change: number; shortfall: number };
  blockReason: string | null;
  // True bila alasan blok adalah uang kurang; pesannya sudah tampil di bawah kolom Uang diterima, jadi tidak diulang di tombol simpan.
  isBlockedByCash: boolean;
};

// Teks kosong berarti 0; teks yang bukan angka Rupiah valid menghasilkan null.
function parseMoneyText(text: string): number | null {
  return text.trim() === '' ? 0 : parseRupiah(text);
}

type Block = { text: string; isCashShortage: boolean };

function getBlock(view: Omit<CartView, 'blockReason' | 'isBlockedByCash'>, cart: CartState, allowOversell: boolean): Block | null {
  const other = (text: string): Block => ({ text, isCashShortage: false });
  if (view.lines.length === 0) return other('Keranjang masih kosong.');
  if (view.lines.some((line) => line.isArchived)) return other('Ada barang yang sudah diarsipkan.');
  if (view.transactionDiscountInvalid || view.lines.some((line) => line.discountInvalid)) {
    return other('Isi diskon dengan angka, misalnya 4.000.');
  }
  if (hasDiscountProblems(view.totals)) return other('Diskon melebihi nilai barang.');
  if (!allowOversell && view.lines.some((line) => line.exceedsStock)) {
    return other('Ada barang yang melebihi stok.');
  }
  if (cart.paymentMethod === 'tunai') {
    if (view.cash.invalid) return other('Isi uang diterima dengan angka.');
    if (view.cash.shortfall > 0) {
      return { text: `Uang diterima kurang ${formatRupiah(view.cash.shortfall)}.`, isCashShortage: true };
    }
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
        isArchived: product.archivedAt !== null,
        priceChangedFrom: line.priceAtAdd === product.sellingPrice ? null : line.priceAtAdd,
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
  const block = getBlock(partial, cart, allowOversell);
  return { ...partial, blockReason: block?.text ?? null, isBlockedByCash: block?.isCashShortage ?? false };
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
