import type { Product } from './schema';
import { getStockValue } from './stock-value';

type StockSummary = {
  productCount: number;
  totalUnits: number;
  stockValue: number;
};

export function getStockSummary(products: Product[]): StockSummary {
  return {
    productCount: products.length,
    totalUnits: products.reduce((sum, product) => sum + product.stockQuantity, 0),
    stockValue: products.reduce((sum, product) => sum + getStockValue(product.stockQuantity, product.purchasePrice), 0),
  };
}
