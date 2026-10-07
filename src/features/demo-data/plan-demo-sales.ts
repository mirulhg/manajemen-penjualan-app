import type { PaymentMethod } from '../../lib/db/records';
import { DEMO_PRODUCTS } from './demo-products';
import { createRandom } from './prng';

export const DEMO_SALES_DAYS = 60;
const DEMO_SEED = 20261007;
const MAX_SALES_PER_DAY = 8;

export type DemoSaleOutcome =
  | { type: 'normal' }
  | { type: 'cancel'; reason: string }
  | { type: 'return'; itemIndex: number; quantity: number; reason: string };

export type PlannedDemoSale = {
  // 1 = 60 hari lalu, 60 = kemarin. Hari ini sengaja tidak diisi.
  day: number;
  // Urutan transaksi di hari itu; menentukan jam (08:00 + 2 jam per urutan).
  slot: number;
  items: { productIndex: number; quantity: number }[];
  paymentMethod: PaymentMethod;
  outcome: DemoSaleOutcome;
};

const CANCEL_REASONS = ['Pembeli membatalkan', 'Salah input barang'];
const RETURN_REASONS = ['Kemasan rusak', 'Salah ambil barang'];

function pick<Item>(random: () => number, options: readonly Item[]): Item {
  const chosen = options[Math.floor(random() * options.length)];
  if (chosen === undefined) throw new Error('Daftar pilihan kosong.');
  return chosen;
}

function pickPayment(random: () => number): PaymentMethod {
  const roll = random();
  if (roll < 0.55) return 'tunai';
  return roll < 0.85 ? 'qris' : 'transfer';
}

function pickOutcome(random: () => number): DemoSaleOutcome {
  const roll = random();
  if (roll < 0.02) return { type: 'cancel', reason: pick(random, CANCEL_REASONS) };
  if (roll < 0.06) return { type: 'return', itemIndex: 0, quantity: 1, reason: pick(random, RETURN_REASONS) };
  return { type: 'normal' };
}

// Deterministik: hanya bergantung pada DEMO_SEED, bukan pada tanggal hari ini atau Math.random.
export function planDemoSales(): PlannedDemoSale[] {
  const random = createRandom(DEMO_SEED);
  const productIndexes = DEMO_PRODUCTS.map((_, index) => index);
  const plan: PlannedDemoSale[] = [];

  for (let day = 1; day <= DEMO_SALES_DAYS; day += 1) {
    const count = 4 + Math.floor(random() * (MAX_SALES_PER_DAY - 3));
    for (let slot = 0; slot < count; slot += 1) {
      const lineCount = 1 + Math.floor(random() * 3);
      const items: PlannedDemoSale['items'] = [];
      while (items.length < lineCount) {
        const productIndex = pick(random, productIndexes);
        if (items.some((item) => item.productIndex === productIndex)) continue;
        items.push({ productIndex, quantity: 1 + Math.floor(random() * 3) });
      }
      plan.push({ day, slot, items, paymentMethod: pickPayment(random), outcome: pickOutcome(random) });
    }
  }
  return plan;
}

// Waktu transaksi dalam tanggal lokal perangkat.
export function getDemoSaleTime(sale: PlannedDemoSale, today: Date): Date {
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + sale.day - (DEMO_SALES_DAYS + 1), 8 + sale.slot * 2);
}

// Jumlah bersih terjual per barang (setelah batal dan retur); stok awal = stok akhir yang diinginkan + angka ini.
export function getNetSoldQuantities(plan: PlannedDemoSale[]): number[] {
  const netSold = DEMO_PRODUCTS.map(() => 0);
  for (const sale of plan) {
    if (sale.outcome.type === 'cancel') continue;
    sale.items.forEach((item, index) => {
      const returned = sale.outcome.type === 'return' && sale.outcome.itemIndex === index ? sale.outcome.quantity : 0;
      netSold[item.productIndex] = (netSold[item.productIndex] ?? 0) + item.quantity - returned;
    });
  }
  return netSold;
}
