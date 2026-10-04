import type { Sale, SaleItem } from './records';

type LineForAllocation = Pick<SaleItem, 'quantity' | 'unitPrice' | 'discount'>;

// Membagi total transaksi ke setiap baris sebanding nilai barisnya setelah diskon baris (diskon transaksi ikut terbagi).
// Pembulatan sisa terbesar: jumlah nilai bersih semua baris selalu persis sama dengan sale.total.
// Bila sisa pecahan sama, baris yang lebih awal di `items` menang; pemanggil harus memberi urutan yang stabil.
export function allocateLineNets(sale: Pick<Sale, 'total'>, items: LineForAllocation[]): number[] {
  const lineValues = items.map((item) => item.quantity * item.unitPrice - item.discount);
  const valueSum = lineValues.reduce((sum, value) => sum + value, 0);
  if (valueSum <= 0) return items.map(() => 0);

  // BigInt: perkalian nilai baris dengan total bisa melewati batas bilangan bulat aman untuk transaksi besar.
  const divisor = BigInt(valueSum);
  const shares = lineValues.map((value) => {
    const scaled = BigInt(value) * BigInt(sale.total);
    return { floor: Number(scaled / divisor), remainder: scaled % divisor };
  });
  const nets = shares.map((share) => share.floor);
  const leftover = sale.total - nets.reduce((sum, net) => sum + net, 0);

  const byLargestRemainder = shares
    .map((share, index) => ({ index, remainder: share.remainder }))
    .sort((a, b) => (a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1));
  for (const { index } of byLargestRemainder.slice(0, leftover)) {
    nets[index] = (nets[index] ?? 0) + 1;
  }
  return nets;
}

// Urutan tetap (nama lalu id) supaya alokasi pembulatan dan tampilan selalu sama untuk transaksi yang sama.
export function sortSaleItems(items: SaleItem[]): SaleItem[] {
  return [...items].sort(
    (a, b) => a.productName.localeCompare(b.productName, 'id') || a.id.localeCompare(b.id),
  );
}
