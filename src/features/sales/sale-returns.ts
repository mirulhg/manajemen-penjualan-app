import type { Sale, SaleItem, SaleReturn } from '../../lib/db/records';
import { allocateLineNets } from './allocate-line-nets';

export type ReturnRequestLine = {
  saleItemId: string;
  quantity: number;
};

export type SaleItemProgress = {
  item: SaleItem;
  net: number;
  returnedQuantity: number;
  refundedAmount: number;
  remaining: number;
};

// Retur k dari n unit = floor(net × k / n); retur yang menghabiskan unit terakhir mendapat sisa nilai bersihnya,
// sehingga seluruh retur sebuah baris persis sama dengan nilai bersih barisnya.
export function refundAmountFor(
  lineNet: number,
  lineQuantity: number,
  alreadyReturnedQuantity: number,
  alreadyRefundedAmount: number,
  returnQuantity: number,
): number {
  if (alreadyReturnedQuantity + returnQuantity >= lineQuantity) {
    return lineNet - alreadyRefundedAmount;
  }
  return Math.floor((lineNet * returnQuantity) / lineQuantity);
}

// Urutan tetap (nama lalu id) supaya alokasi pembulatan dan tampilan selalu sama untuk transaksi yang sama.
export function sortSaleItems(items: SaleItem[]): SaleItem[] {
  return [...items].sort(
    (a, b) => a.productName.localeCompare(b.productName, 'id') || a.id.localeCompare(b.id),
  );
}

export function getItemProgress(
  sale: Pick<Sale, 'total'>,
  items: SaleItem[],
  returns: SaleReturn[],
): SaleItemProgress[] {
  const sortedItems = sortSaleItems(items);
  const nets = allocateLineNets(sale, sortedItems);
  const returned = new Map<string, { quantity: number; amount: number }>();
  for (const saleReturn of returns) {
    for (const line of saleReturn.items) {
      const previous = returned.get(line.saleItemId) ?? { quantity: 0, amount: 0 };
      returned.set(line.saleItemId, {
        quantity: previous.quantity + line.quantity,
        amount: previous.amount + line.refundAmount,
      });
    }
  }

  return sortedItems.map((item, index) => {
    const { quantity, amount } = returned.get(item.id) ?? { quantity: 0, amount: 0 };
    return {
      item,
      net: nets[index] ?? 0,
      returnedQuantity: quantity,
      refundedAmount: amount,
      remaining: item.quantity - quantity,
    };
  });
}

// Dipakai API dan pratinjau di layar, supaya "Uang dikembalikan" yang terlihat sama dengan yang tersimpan.
// Mengabaikan baris yang tidak dikenal atau jumlahnya melebihi sisa; pemvalidasi ada di pemanggil.
export function calculateReturn(progress: SaleItemProgress[], requested: ReturnRequestLine[]) {
  const lines = requested.flatMap((request) => {
    const line = progress.find((entry) => entry.item.id === request.saleItemId);
    if (!line || request.quantity < 1 || request.quantity > line.remaining) return [];
    return [
      {
        saleItemId: request.saleItemId,
        productId: line.item.productId,
        quantity: request.quantity,
        refundAmount: refundAmountFor(
          line.net,
          line.item.quantity,
          line.returnedQuantity,
          line.refundedAmount,
          request.quantity,
        ),
      },
    ];
  });
  return { lines, refundTotal: lines.reduce((sum, line) => sum + line.refundAmount, 0) };
}
