import type { PaymentMethod } from '../../lib/db/records';

export const SAMPLE_SALES_DAYS = 60;

export type PlannedSale = {
  // 1 = 60 hari lalu, 60 = kemarin. Hari ini sengaja tidak diisi.
  day: number;
  // Urutan transaksi di hari itu; menentukan jam (08:00 + 2 jam per urutan).
  slot: number;
  items: { productIndex: number; quantity: number }[];
  paymentMethod: PaymentMethod;
};

// Indeks mengacu ke urutan produk di Data Contoh Produk (P[0..29]). Roti Tawar dan Pasta Gigi tidak pernah terjual (produk mati);
// Teh Siap Minum hanya terjual di 25 hari pertama (produk yang berhenti laku).
const NEVER_SOLD = new Set([16, 24]);
const EARLY_ONLY = new Set([11]);
const EARLY_LAST_DAY = 25;
const PRODUCT_COUNT = 30;
const METHODS: PaymentMethod[] = ['tunai', 'transfer', 'qris'];

function fixProduct(index: number, day: number): number {
  let current = index;
  while (NEVER_SOLD.has(current) || (EARLY_ONLY.has(current) && day > EARLY_LAST_DAY)) {
    current = (current + 1) % PRODUCT_COUNT;
  }
  return current;
}

function planItems(day: number, slot: number): PlannedSale['items'] {
  const base = (day * 7 + slot * 3) % PRODUCT_COUNT;
  const first = fixProduct(base, day);
  const items = [{ productIndex: first, quantity: 1 + ((day + slot) % 3) }];
  if (slot % 2 === 0) {
    let second = fixProduct((base + 11) % PRODUCT_COUNT, day);
    if (second === first) second = fixProduct((second + 1) % PRODUCT_COUNT, day);
    items.push({ productIndex: second, quantity: 1 });
  }
  return items;
}

// Deterministik (tanpa Math.random). Aturannya harus sama dengan Docs/simulasi-penjualan-contoh.py.
export function planSampleSales(): PlannedSale[] {
  const plan: PlannedSale[] = [];
  for (let day = 1; day <= SAMPLE_SALES_DAYS; day += 1) {
    const count = 3 + (day % 5);
    for (let slot = 0; slot < count; slot += 1) {
      plan.push({
        day,
        slot,
        items: planItems(day, slot),
        paymentMethod: METHODS[slot % 3] ?? 'tunai',
      });
    }
  }
  return plan;
}

// Waktu transaksi dalam tanggal lokal perangkat.
export function getSampleSaleTime(plan: PlannedSale, today: Date): Date {
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + plan.day - (SAMPLE_SALES_DAYS + 1),
    8 + plan.slot * 2,
  );
}
