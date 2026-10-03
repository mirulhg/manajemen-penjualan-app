import { Link, useLocation, useParams } from 'react-router';

import { useProduct } from '../api/use-product';
import { getListPath } from '../list-return-state';
import { PriceHistory } from './PriceHistory';
import { ProductArchiveSection } from './ProductArchiveSection';
import { ProductDetailSkeleton } from './ProductDetailSkeleton';
import { ProductInfo } from './ProductInfo';
import { ProductNotFound } from './ProductNotFound';
import { ProductPhoto } from './ProductPhoto';
import { StockListError } from './StockListError';
import { StockMovementHistory } from './StockMovementHistory';
import { SubpageLayout } from '../../../components/layout/SubpageLayout';

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
      <SubpageLayout title="Detail barang" heading="Detail Barang" backTo={listPath} backLabel="Kembali ke daftar stok">
        <ProductDetailSkeleton />
      </SubpageLayout>
    );
  }

  if (error) {
    return (
      <SubpageLayout title="Detail barang" heading="Detail Barang" backTo={listPath} backLabel="Kembali ke daftar stok">
        <StockListError error={error} onRetry={handleRetry} />
      </SubpageLayout>
    );
  }

  if (!product) {
    return (
      <SubpageLayout title="Barang tidak ditemukan" heading="Detail Barang" backTo={listPath} backLabel="Kembali ke daftar stok">
        <ProductNotFound />
      </SubpageLayout>
    );
  }

  return (
    <SubpageLayout title={product.name} heading="Detail Barang" backTo={listPath} backLabel="Kembali ke daftar stok">
      <ProductPhoto productId={product.id} productName={product.name} />
      <ProductInfo product={product} />
      <Link
        to={`/stok/${product.id}/sesuaikan`}
        state={locationState}
        className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-medium text-on-primary"
      >
        Sesuaikan stok
      </Link>
      <Link
        to={`/stok/${product.id}/ubah`}
        state={locationState}
        className="ml-2 mt-4 inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 font-medium"
      >
        Ubah barang
      </Link>
      <ProductArchiveSection product={product} />
      <PriceHistory productId={product.id} />
      <StockMovementHistory productId={product.id} unit={product.unit} />
    </SubpageLayout>
  );
}
