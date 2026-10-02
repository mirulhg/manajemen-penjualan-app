import type { Product } from './schema';

type StockSummary = {
  productCount: number;
  totalUnits: number;
  stockValue: number;
};

export function getStockSummary(products: Product[]): StockSummary {
  return {
    productCount: products.length,
    totalUnits: products.reduce((sum, product) => sum + product.stockQuantity, 0),
    stockValue: products.reduce((sum, product) => sum + product.stockQuantity * product.purchasePrice, 0),
  };
}
