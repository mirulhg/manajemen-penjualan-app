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
  const detailPath = `/stok/${productId}`;

  function handleRetry() {
    void refetch();
  }

  if (isPending) {
    return (
      <StockSubpageLayout heading="Penyesuaian Stok" title="Sesuaikan stok" backTo={detailPath} backLabel="Kembali ke detail barang">
        <AdjustStockSkeleton />
      </StockSubpageLayout>
    );
  }

  if (error) {
    return (
      <StockSubpageLayout heading="Penyesuaian Stok" title="Sesuaikan stok" backTo={detailPath} backLabel="Kembali ke detail barang">
        <StockListError error={error} onRetry={handleRetry} />
      </StockSubpageLayout>
    );
  }

  if (!product) {
    return (
      <StockSubpageLayout heading="Penyesuaian Stok" title="Barang tidak ditemukan" backTo={getListPath(location.state)} backLabel="Kembali ke daftar stok">
        <ProductNotFound />
      </StockSubpageLayout>
    );
  }

  return (
    <StockSubpageLayout heading="Penyesuaian Stok" title={`Sesuaikan ${product.name}`} backTo={detailPath} backLabel="Kembali ke detail barang">
      <AdjustStockSummary product={product} />
      <AdjustStockForm product={product} />
    </StockSubpageLayout>
  );
}
