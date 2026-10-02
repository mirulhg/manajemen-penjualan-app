import { useLocation, useParams } from 'react-router';

import { useProduct } from '../api/use-product';
import { getListPath } from '../list-return-state';
import { AdjustStockForm } from './AdjustStockForm';
import { AdjustStockLayout } from './AdjustStockLayout';
import { AdjustStockSkeleton } from './AdjustStockSkeleton';
import { AdjustStockSummary } from './AdjustStockSummary';
import { ProductNotFound } from './ProductNotFound';
import { StockListError } from './StockListError';

export function AdjustStockPage() {
  const { productId = '' } = useParams();
  const location = useLocation();
  const { data: product, isPending, error, refetch } = useProduct(productId);
  const backTo = getListPath(location.state);

  function handleRetry() {
    void refetch();
  }

  if (isPending) {
    return (
      <AdjustStockLayout title="Sesuaikan stok" backTo={backTo}>
        <AdjustStockSkeleton />
      </AdjustStockLayout>
    );
  }

  if (error) {
    return (
      <AdjustStockLayout title="Sesuaikan stok" backTo={backTo}>
        <StockListError error={error} onRetry={handleRetry} />
      </AdjustStockLayout>
    );
  }

  if (!product) {
    return (
      <AdjustStockLayout title="Barang tidak ditemukan" backTo={backTo}>
        <ProductNotFound />
      </AdjustStockLayout>
    );
  }

  return (
    <AdjustStockLayout title={`Sesuaikan ${product.name}`} backTo={backTo}>
      <AdjustStockSummary product={product} />
      <AdjustStockForm product={product} />
    </AdjustStockLayout>
  );
}
