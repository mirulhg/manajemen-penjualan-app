import Dexie from 'dexie';
import type { EntityTable } from 'dexie';

import { STOCK_MOVEMENT_COUNTER } from './records';
import type { Counter, Product, StockMovement } from './records';

type LegacyStockMovement = Omit<StockMovement, 'seq'>;

class StockDatabase extends Dexie {
  products!: EntityTable<Product, 'id'>;
  stockMovements!: EntityTable<StockMovement, 'id'>;
  counters!: EntityTable<Counter, 'name'>;

  constructor() {
    super('manajemen-stok');
    this.version(1).stores({
      products: 'id, &sku, category, updatedAt',
      stockMovements: 'id, productId, [productId+createdAt]',
    });
    this.version(2)
      .stores({
        stockMovements: 'id, productId, [productId+createdAt], &seq, [productId+seq]',
        counters: 'name',
      })
      .upgrade(async (transaction) => {
        const movements = transaction.table<LegacyStockMovement, string>('stockMovements');
        const ordered = (await movements.toArray()).sort(
          (a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
        );
        await movements.bulkPut(ordered.map((movement, index) => ({ ...movement, seq: index + 1 })));
        if (ordered.length > 0) {
          await transaction
            .table<Counter, string>('counters')
            .put({ name: STOCK_MOVEMENT_COUNTER, value: ordered.length });
        }
      });
  }
}

export const db = new StockDatabase();
