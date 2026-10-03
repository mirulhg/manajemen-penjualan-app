import Dexie from 'dexie';
import type { EntityTable } from 'dexie';

import { STOCK_MOVEMENT_COUNTER, toCategoryKey } from './records';
import type {
  Category,
  Counter,
  PriceChange,
  Product,
  ProductPhoto,
  Sale,
  SaleItem,
  SaleReturn,
  Setting,
  StockMovement,
} from './records';

type LegacyStockMovement = Omit<StockMovement, 'seq'>;
type LegacyProduct = Omit<Product, 'archivedAt'> & { archivedAt?: string | null };
type LegacySale = Omit<Sale, 'status' | 'refundedTotal'> & {
  status?: Sale['status'];
  refundedTotal?: number;
};

class StockDatabase extends Dexie {
  products!: EntityTable<Product, 'id'>;
  stockMovements!: EntityTable<StockMovement, 'id'>;
  counters!: EntityTable<Counter, 'name'>;
  sales!: EntityTable<Sale, 'id'>;
  saleItems!: EntityTable<SaleItem, 'id'>;
  settings!: EntityTable<Setting, 'key'>;
  saleReturns!: EntityTable<SaleReturn, 'id'>;
  priceChanges!: EntityTable<PriceChange, 'id'>;
  productPhotos!: EntityTable<ProductPhoto, 'productId'>;
  categories!: EntityTable<Category, 'id'>;

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
    this.version(3).stores({
      sales: 'id, &number, createdAt',
      saleItems: 'id, saleId, productId',
      settings: 'key',
    });
    this.version(4)
      .stores({
        sales: 'id, &number, createdAt, actor',
        saleReturns: 'id, &number, saleId, createdAt',
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<LegacySale, string>('sales')
          .toCollection()
          .modify((sale) => {
            sale.status ??= 'selesai';
            sale.refundedTotal ??= 0;
          });
      });
    this.version(5)
      .stores({
        priceChanges: 'id, productId, [productId+seq]',
        productPhotos: 'productId',
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<LegacyProduct, string>('products')
          .toCollection()
          .modify((product) => {
            product.archivedAt ??= null;
          });
      });
    this.version(6)
      .stores({ categories: 'id, &nameKey' })
      .upgrade(async (transaction) => {
        const products = await transaction.table<Product, string>('products').toArray();
        const now = new Date().toISOString();
        const byKey = new Map<string, Category>();
        // Urutan nama produk menentukan ejaan yang dipakai bila ada kategori yang hanya beda huruf.
        for (const product of products.sort((a, b) => a.name.localeCompare(b.name, 'id'))) {
          const nameKey = toCategoryKey(product.category);
          if (byKey.has(nameKey)) continue;
          byKey.set(nameKey, {
            id: crypto.randomUUID(),
            name: product.category,
            nameKey,
            createdAt: now,
            updatedAt: now,
          });
        }
        await transaction.table<Category, string>('categories').bulkAdd([...byKey.values()]);
        // Produk memakai ejaan kategori yang sama dengan tabel, supaya pencocokan nama tetap tepat.
        await transaction
          .table<Product, string>('products')
          .toCollection()
          .modify((product) => {
            const category = byKey.get(toCategoryKey(product.category));
            if (category) product.category = category.name;
          });
      });
  }
}

export const db = new StockDatabase();
