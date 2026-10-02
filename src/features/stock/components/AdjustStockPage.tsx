import { useLocation, useParams } from 'react-router';

import { useProduct } from '../api/use-product';
import { getListPath } from '../list-return-state';
import { AdjustStockForm } from './AdjustStockForm';
import { AdjustStockSkeleton } from './AdjustStockSkeleton';
import { AdjustStockSummary } from './AdjustStockSummary';
import { ProductNotFound } from './ProductNotFound';
import { StockListError } from './StockListError';
import { StockSubpageLayout } from './StockSubpageLayout';

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
      <StockSubpageLayout heading="Penyesuaian Stok" title="Sesuaikan stok" backTo={backTo}>
        <AdjustStockSkeleton />
      </StockSubpageLayout>
    );
  }

  if (error) {
    return (
      <StockSubpageLayout heading="Penyesuaian Stok" title="Sesuaikan stok" backTo={backTo}>
        <StockListError error={error} onRetry={handleRetry} />
      </StockSubpageLayout>
    );
  }

  if (!product) {
    return (
      <StockSubpageLayout heading="Penyesuaian Stok" title="Barang tidak ditemukan" backTo={backTo}>
        <ProductNotFound />
      </StockSubpageLayout>
    );
  }

  return (
    <StockSubpageLayout heading="Penyesuaian Stok" title={`Sesuaikan ${product.name}`} backTo={backTo}>
      <AdjustStockSummary product={product} />
      <AdjustStockForm product={product} />
    </StockSubpageLayout>
  );
}
