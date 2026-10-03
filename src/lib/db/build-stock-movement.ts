import { stockMovementSchema } from './records';
import type { StockMovement } from './records';

// Satu-satunya pembuat rekaman pergerakan stok, dipakai oleh stok, produk baru, dan penjualan.
export function buildStockMovement(fields: Omit<StockMovement, 'id'>): StockMovement {
  return stockMovementSchema.parse({ ...fields, id: crypto.randomUUID() });
}
