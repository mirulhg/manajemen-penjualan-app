import { Link, useLocation, useParams } from 'react-router';

import { useProduct } from '../api/use-product';
import { getListPath } from '../list-return-state';
import { ProductDetailSkeleton } from './ProductDetailSkeleton';
import { ProductInfo } from './ProductInfo';
import { ProductNotFound } from './ProductNotFound';
import { StockListError } from './StockListError';
import { StockMovementHistory } from './StockMovementHistory';
import { StockSubpageLayout } from './StockSubpageLayout';

export function ProductDetailPage() {
  const { productId = '' } = useParams();
  const location = useLocation();
  const { data: product, isPending, error, refetch } = useProduct(productId);
  // location.state bertipe any dari router; dipersempit ke unknown sebelum diteruskan.
  const locationState: unknown = location.state;
  const listPath = getListPath(locationState);

  function handleRetry() {
    void refetch();
  }

  if (isPending) {
    return (
      <StockSubpageLayout title="Detail barang" heading="Detail Barang" backTo={listPath} backLabel="Kembali ke daftar stok">
        <ProductDetailSkeleton />
      </StockSubpageLayout>
    );
  }

  if (error) {
    return (
      <StockSubpageLayout title="Detail barang" heading="Detail Barang" backTo={listPath} backLabel="Kembali ke daftar stok">
        <StockListError error={error} onRetry={handleRetry} />
      </StockSubpageLayout>
    );
  }

  if (!product) {
    return (
      <StockSubpageLayout title="Barang tidak ditemukan" heading="Detail Barang" backTo={listPath} backLabel="Kembali ke daftar stok">
        <ProductNotFound />
      </StockSubpageLayout>
    );
  }

  return (
    <StockSubpageLayout title={product.name} heading="Detail Barang" backTo={listPath} backLabel="Kembali ke daftar stok">
      <ProductInfo product={product} />
      <Link
        to={`/stok/${product.id}/sesuaikan`}
        state={locationState}
        className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-medium text-on-primary"
      >
        Sesuaikan stok
      </Link>
      <StockMovementHistory productId={product.id} unit={product.unit} />
    </StockSubpageLayout>
  );
}
