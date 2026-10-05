import type { Product, StockMovement } from '../../lib/db/records';
import type { MovementRow } from './report-columns';

type MovementTotals = {
  opening: number;
  incoming: number;
  sold: number;
  returned: number;
  correction: number;
  closing: number;
};

export type StockMovementReport = {
  rows: MovementRow[];
  // Barang yang jumlah fisiknya berubah di periode (ada pergerakan dengan selisih bukan 0). Tidak diturunkan dari kolom: jual lalu
  // batal, atau koreksi +3 lalu -3, tetap bergerak walau bersihnya 0. Stok awal 0 (barang baru tanpa stok) bukan pergerakan fisik.
  movedSkus: Set<string>;
  summary: MovementTotals & { productCount: number; movedCount: number };
};

type PeriodSums = { incoming: number; sold: number; returned: number; correction: number };

const ZERO_SUMS: PeriodSums = { incoming: 0, sold: 0, returned: 0, correction: 0 };

// Masuk = masuk + awal (stok pertama barang baru); terjual = jual (positif); retur/batal = barang kembali ke rak; koreksi bertanda.
function addMovement(sums: PeriodSums, movement: StockMovement): PeriodSums {
  const delta = movement.quantityAfter - movement.quantityBefore;
  switch (movement.type) {
    case 'masuk':
    case 'awal':
      return { ...sums, incoming: sums.incoming + delta };
    case 'jual':
      return { ...sums, sold: sums.sold - delta };
    case 'retur':
    case 'batal':
      return { ...sums, returned: sums.returned + delta };
    case 'koreksi':
      return { ...sums, correction: sums.correction + delta };
  }
}

type MovementReportInput = {
  // Hanya produk yang sudah ada pada akhir periode.
  products: Product[];
  periodMovements: StockMovement[];
  // Σ (sesudah - sebelum) pergerakan sesudah akhir periode, per produk.
  deltaAfterPeriod: Map<string, number>;
};

// Murni. Stok akhir = stok sekarang - perubahan sesudah periode; stok awal = akhir - perubahan bersih dalam periode,
// sehingga awal + masuk + retur/batal - terjual + koreksi = akhir selalu berlaku.
export function buildStockMovementReport({ products, periodMovements, deltaAfterPeriod }: MovementReportInput): StockMovementReport {
  const sumsByProduct = new Map<string, PeriodSums>();
  const movedProductIds = new Set<string>();
  for (const movement of periodMovements) {
    sumsByProduct.set(movement.productId, addMovement(sumsByProduct.get(movement.productId) ?? ZERO_SUMS, movement));
    if (movement.quantityAfter !== movement.quantityBefore) movedProductIds.add(movement.productId);
  }

  const movedSkus = new Set<string>();
  const rows: MovementRow[] = products
    .map((product) => {
      const sums = sumsByProduct.get(product.id);
      if (movedProductIds.has(product.id)) movedSkus.add(product.sku);
      const { incoming, sold, returned, correction } = sums ?? ZERO_SUMS;
      const closing = product.stockQuantity - (deltaAfterPeriod.get(product.id) ?? 0);
      return {
        sku: product.sku,
        name: product.name,
        category: product.category,
        unit: product.unit,
        opening: closing - (incoming + returned - sold + correction),
        incoming,
        sold,
        returned,
        correction,
        closing,
        status: product.archivedAt ? 'Diarsipkan' : 'Aktif',
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'id') || a.sku.localeCompare(b.sku));

  const sum = (pick: (row: MovementRow) => number) => rows.reduce((total, row) => total + pick(row), 0);
  return {
    rows,
    movedSkus,
    summary: {
      opening: sum((row) => row.opening),
      incoming: sum((row) => row.incoming),
      sold: sum((row) => row.sold),
      returned: sum((row) => row.returned),
      correction: sum((row) => row.correction),
      closing: sum((row) => row.closing),
      productCount: rows.length,
      movedCount: movedSkus.size,
    },
  };
}
