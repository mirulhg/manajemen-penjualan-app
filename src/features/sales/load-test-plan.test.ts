import { describe, expect, it } from 'vitest';

import { LOAD_TEST_SALE_COUNT, planLoadTestSales } from './load-test-plan';

const NOW = new Date(2026, 9, 3, 10, 0, 0);

describe('planLoadTestSales', () => {
  const plan = planLoadTestSales(NOW, 2000);

  it('10.000 transaksi, semuanya di bulan lalu (September 2026) dan berurutan waktu', () => {
    expect(plan).toHaveLength(LOAD_TEST_SALE_COUNT);
    expect(plan.every((sale) => sale.time.getFullYear() === 2026 && sale.time.getMonth() === 8)).toBe(true);
    const times = plan.map((sale) => sale.time.getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it('tersebar rata: ±333 per hari selama 30 hari', () => {
    const perDay = new Map<number, number>();
    for (const sale of plan) perDay.set(sale.time.getDate(), (perDay.get(sale.time.getDate()) ?? 0) + 1);

    expect(perDay.size).toBe(30);
    expect([...perDay.values()].every((count) => count === 333 || count === 334)).toBe(true);
  });

  it('1-3 barang berbeda per transaksi dari barang yang ada', () => {
    for (const sale of plan) {
      expect(sale.items.length).toBeGreaterThanOrEqual(1);
      expect(sale.items.length).toBeLessThanOrEqual(3);
      expect(new Set(sale.items.map((item) => item.productIndex)).size).toBe(sale.items.length);
      expect(sale.items.every((item) => item.productIndex >= 0 && item.productIndex < 2000 && item.quantity >= 1)).toBe(true);
    }
  });

  it('deterministik: dua kali dibuat hasilnya sama', () => {
    expect(planLoadTestSales(NOW, 2000)).toEqual(plan);
  });
});
