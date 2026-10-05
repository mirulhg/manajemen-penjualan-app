import type { PaymentMethod } from '../../lib/db/records';

export const LOAD_TEST_SALE_COUNT = 10_000;
const METHODS: PaymentMethod[] = ['tunai', 'transfer', 'qris'];
const DAY_START_HOUR = 8;
const OPEN_HOURS = 12;
const MS_PER_HOUR = 3_600_000;

export type PlannedLoadSale = {
  time: Date;
  items: { productIndex: number; quantity: number }[];
  paymentMethod: PaymentMethod;
};

// Deterministik (tanpa random). LOAD_TEST_SALE_COUNT transaksi tersebar rata di seluruh bulan lalu (waktu lokal perangkat),
// kronologis, masing-masing 1-3 barang berbeda dari productCount barang.
export function planLoadTestSales(now: Date, productCount: number): PlannedLoadSale[] {
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  const perDay = Math.floor(LOAD_TEST_SALE_COUNT / daysInMonth);
  const remainder = LOAD_TEST_SALE_COUNT % daysInMonth;

  const plan: PlannedLoadSale[] = [];
  for (let day = 0; day < daysInMonth; day += 1) {
    const count = perDay + (day < remainder ? 1 : 0);
    const dayStart = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() + day, DAY_START_HOUR);
    for (let slot = 0; slot < count; slot += 1) {
      const index = plan.length;
      plan.push({
        time: new Date(dayStart.getTime() + Math.floor((slot * OPEN_HOURS * MS_PER_HOUR) / count)),
        items: Array.from({ length: 1 + (index % 3) }, (_, position) => ({
          productIndex: (index * 37 + position * 101) % productCount,
          quantity: 1 + ((index + position) % 3),
        })),
        paymentMethod: METHODS[index % METHODS.length] ?? 'tunai',
      });
    }
  }
  return plan;
}
