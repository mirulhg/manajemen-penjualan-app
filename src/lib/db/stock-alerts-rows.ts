import type { Product, StockAlert, StockAlertLevel } from './records';
import { getStockStatus } from './stock-status';

// Barang aman atau diarsipkan tidak punya peringatan.
export function getAlertLevel(product: Product, defaultMinStock: number): StockAlertLevel | null {
  if (product.archivedAt !== null) return null;
  const status = getStockStatus(product.stockQuantity, product.minStock, defaultMinStock);
  return status === 'aman' ? null : status;
}

// Aturan episode (satu peringatan terbuka per produk):
//  aman -> menipis/habis : peringatan baru, belum dibaca
//  menipis -> habis      : level naik dan belum dibaca lagi (informasi baru)
//  habis -> menipis      : level turun, tanpa notifikasi baru (status baca tidak berubah)
//  kembali aman/diarsip  : peringatan ditutup; turun lagi = episode baru
// Murni: dipakai syncStockAlerts dan upgrade Dexie v9. Mengembalikan hanya peringatan yang berubah atau baru.
export function planAlertChanges(
  products: Product[],
  openAlerts: StockAlert[],
  defaultMinStock: number,
  nowIso: string,
): StockAlert[] {
  const openByProduct = new Map(openAlerts.map((alert) => [alert.productId, alert]));
  const changes: StockAlert[] = [];

  for (const product of products) {
    const level = getAlertLevel(product, defaultMinStock);
    const open = openByProduct.get(product.id);

    if (level === null) {
      if (open) changes.push({ ...open, isOpen: 0, resolvedAt: nowIso });
    } else if (!open) {
      changes.push({
        id: crypto.randomUUID(),
        productId: product.id,
        level,
        openedAt: nowIso,
        resolvedAt: null,
        readAt: null,
        isOpen: 1,
      });
    } else if (open.level === 'menipis' && level === 'habis') {
      changes.push({ ...open, level: 'habis', readAt: null });
    } else if (open.level === 'habis' && level === 'menipis') {
      changes.push({ ...open, level: 'menipis' });
    }
  }
  return changes;
}
