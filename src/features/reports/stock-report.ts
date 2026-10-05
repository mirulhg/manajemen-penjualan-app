import type { PriceChange, Product } from '../../lib/db/records';
import type { StockRow } from './report-columns';

type StockTotals = { productCount: number; totalUnits: number; totalValue: number };

export type StockReport = {
  rows: StockRow[];
  summary: StockTotals & { active: StockTotals };
};

// Harga beli pada awal hari berikutnya (batas tanggal laporan): nilai `after` perubahan terakhir sebelum batas; bila belum ada
// perubahan sebelum batas tetapi ada sesudahnya, `before` dari perubahan pertama sesudahnya; bila tak pernah berubah, harga sekarang.
export function purchasePriceAt(currentPrice: number, changes: PriceChange[], boundaryIso: string): number {
  const chronological = [...changes].sort((a, b) => a.seq - b.seq);
  const lastBefore = chronological.filter((change) => change.createdAt < boundaryIso).at(-1);
  if (lastBefore) return lastBefore.after;
  return chronological[0]?.before ?? currentPrice;
}

function sumRows(rows: StockRow[]): StockTotals {
  return {
    productCount: rows.length,
    totalUnits: rows.reduce((sum, row) => sum + row.quantity, 0),
    totalValue: rows.reduce((sum, row) => sum + row.value, 0),
  };
}

type StockReportInput = {
  // Hanya produk yang sudah ada pada tanggal laporan.
  products: Product[];
  // Σ (sesudah - sebelum) pergerakan setelah tanggal laporan, per produk.
  deltaAfterDate: Map<string, number>;
  purchaseChanges: Map<string, PriceChange[]>;
  boundaryIso: string;
};

// Murni. Stok pada tanggal D = stok sekarang dikurangi semua perubahan stok setelah D. Stok minus tampil apa adanya, nilainya 0.
export function buildStockReport({ products, deltaAfterDate, purchaseChanges, boundaryIso }: StockReportInput): StockReport {
  const rows: StockRow[] = products
    .map((product) => {
      const quantity = product.stockQuantity - (deltaAfterDate.get(product.id) ?? 0);
      const purchasePrice = purchasePriceAt(product.purchasePrice, purchaseChanges.get(product.id) ?? [], boundaryIso);
      return {
        sku: product.sku,
        name: product.name,
        category: product.category,
        unit: product.unit,
        quantity,
        purchasePrice,
        value: Math.max(quantity, 0) * purchasePrice,
        status: product.archivedAt ? 'Diarsipkan' : 'Aktif',
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'id') || a.sku.localeCompare(b.sku));

  return {
    rows,
    summary: { ...sumRows(rows), active: sumRows(rows.filter((row) => row.status === 'Aktif')) },
  };
}
