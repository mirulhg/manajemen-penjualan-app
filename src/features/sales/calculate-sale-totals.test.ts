import { describe, expect, it } from 'vitest';

import { calculateSaleTotals, hasDiscountProblems } from './calculate-sale-totals';

describe('calculateSaleTotals', () => {
  it('menghitung subtotal, jumlah unit, dan total tanpa diskon', () => {
    const totals = calculateSaleTotals(
      [
        { quantity: 2, unitPrice: 74000, discount: 0 },
        { quantity: 3, unitPrice: 3500, discount: 0 },
        { quantity: 1, unitPrice: 3500, discount: 0 },
      ],
      0,
    );
    expect(totals).toMatchObject({ subtotal: 162000, total: 162000, itemCount: 6, itemDiscountTotal: 0 });
    expect(hasDiscountProblems(totals)).toBe(false);
  });

  it('mengurangi diskon baris dan diskon transaksi', () => {
    const totals = calculateSaleTotals(
      [
        { quantity: 2, unitPrice: 74000, discount: 4000 },
        { quantity: 4, unitPrice: 3500, discount: 0 },
      ],
      2000,
    );
    expect(totals).toMatchObject({
      subtotal: 162000,
      itemDiscountTotal: 4000,
      transactionDiscount: 2000,
      total: 156000,
    });
  });

  it('menandai diskon baris yang melebihi subtotal barisnya', () => {
    const totals = calculateSaleTotals(
      [
        { quantity: 1, unitPrice: 3500, discount: 4000 },
        { quantity: 1, unitPrice: 74000, discount: 1000 },
      ],
      0,
    );
    expect(totals.problems.discountLineIndexes).toEqual([0]);
    expect(hasDiscountProblems(totals)).toBe(true);
  });

  it('menandai diskon transaksi yang melebihi subtotal setelah diskon baris', () => {
    const totals = calculateSaleTotals([{ quantity: 1, unitPrice: 10000, discount: 4000 }], 7000);
    expect(totals.problems.transactionDiscountTooLarge).toBe(true);
    expect(totals.total).toBe(0);
  });

  it('diskon sebesar persis nilainya masih diperbolehkan', () => {
    const totals = calculateSaleTotals([{ quantity: 1, unitPrice: 10000, discount: 10000 }], 0);
    expect(hasDiscountProblems(totals)).toBe(false);
    expect(totals.total).toBe(0);
  });
});
