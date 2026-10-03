export type SaleLineInput = {
  quantity: number;
  unitPrice: number;
  discount: number;
};

export type SaleTotals = {
  subtotal: number;
  itemDiscountTotal: number;
  transactionDiscount: number;
  total: number;
  itemCount: number;
  problems: {
    // Indeks baris yang diskonnya melebihi subtotal barisnya sendiri.
    discountLineIndexes: number[];
    // Diskon transaksi melebihi subtotal setelah diskon baris.
    transactionDiscountTooLarge: boolean;
  };
};

// Dipakai layar kasir dan createSale, supaya angka di layar dan yang tersimpan tidak mungkin berbeda.
export function calculateSaleTotals(lines: SaleLineInput[], transactionDiscount: number): SaleTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const itemDiscountTotal = lines.reduce((sum, line) => sum + line.discount, 0);
  const discountLineIndexes = lines.flatMap((line, index) =>
    line.discount > line.quantity * line.unitPrice ? [index] : [],
  );
  const transactionDiscountTooLarge = transactionDiscount > subtotal - itemDiscountTotal;

  return {
    subtotal,
    itemDiscountTotal,
    transactionDiscount,
    total: Math.max(0, subtotal - itemDiscountTotal - transactionDiscount),
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    problems: { discountLineIndexes, transactionDiscountTooLarge },
  };
}

export function hasDiscountProblems(totals: SaleTotals): boolean {
  return totals.problems.discountLineIndexes.length > 0 || totals.problems.transactionDiscountTooLarge;
}
