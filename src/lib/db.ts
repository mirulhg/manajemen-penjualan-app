import Dexie from 'dexie';
import type { EntityTable } from 'dexie';

import type { Product, StockMovement } from '../features/stock/schema';

class StockDatabase extends Dexie {
  products!: EntityTable<Product, 'id'>;
  stockMovements!: EntityTable<StockMovement, 'id'>;

  constructor() {
    super('manajemen-stok');
    this.version(1).stores({
      products: 'id, &sku, category, updatedAt',
      stockMovements: 'id, productId, [productId+createdAt]',
    });
  }
}

export const db = new StockDatabase();
