import { StockListError, useProducts } from '../../stock';
import { useAllowOversell } from '../api/use-allow-oversell';
import { Cashier } from './Cashier';
import { CashierEmptyState } from './CashierEmptyState';
import { CashierSkeleton } from './CashierSkeleton';

export function CashierContent() {
  const products = useProducts();
  const allowOversell = useAllowOversell();

  function handleRetry() {
    void products.refetch();
    void allowOversell.refetch();
  }

  if (products.isPending || allowOversell.isPending) return <CashierSkeleton />;
  if (products.isError) return <StockListError error={products.error} onRetry={handleRetry} />;
  if (allowOversell.isError) {
    return <StockListError error={allowOversell.error} onRetry={handleRetry} />;
  }
  // Barang arsip tidak bisa dijual, jadi kasir kosong bila semua barang diarsipkan.
  if (products.data.every((product) => product.archivedAt !== null)) return <CashierEmptyState />;

  return <Cashier products={products.data} allowOversell={allowOversell.data} />;
}
