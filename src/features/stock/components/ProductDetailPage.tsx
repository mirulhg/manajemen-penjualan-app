import { useLocation, useParams } from 'react-router';

import { useSession } from '../../session';
import { useProduct } from '../api/use-product';
import { getListPath } from '../list-return-state';
import { ProductDetailSkeleton } from './ProductDetailSkeleton';
import { ProductInfo } from './ProductInfo';
import { ProductNotFound } from './ProductNotFound';
import { ProductOwnerSection } from './ProductOwnerSection';
import { ProductPhoto } from './ProductPhoto';
import { StockListError } from './StockListError';
import { StockMovementHistory } from './StockMovementHistory';
import { SubpageLayout } from '../../../components/layout/SubpageLayout';

export function ProductDetailPage() {
  const { productId = '' } = useParams();
  const { isCashierMode } = useSession();
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
      <SubpageLayout title="Detail barang" heading="Detail Barang" back={{ to: listPath, label: 'Kembali ke daftar stok' }}>
        <ProductDetailSkeleton />
      </SubpageLayout>
    );
  }

  if (error) {
    return (
      <SubpageLayout title="Detail barang" heading="Detail Barang" back={{ to: listPath, label: 'Kembali ke daftar stok' }}>
        <StockListError error={error} onRetry={handleRetry} />
      </SubpageLayout>
    );
  }

  if (!product) {
    return (
      <SubpageLayout title="Barang tidak ditemukan" heading="Detail Barang" back={{ to: listPath, label: 'Kembali ke daftar stok' }}>
        <ProductNotFound />
      </SubpageLayout>
    );
  }

  return (
    <SubpageLayout title={product.name} heading="Detail Barang" back={{ to: listPath, label: 'Kembali ke daftar stok' }}>
      <ProductPhoto productId={product.id} productName={product.name} />
      <ProductInfo product={product} />
      {!isCashierMode && <ProductOwnerSection product={product} locationState={locationState} />}
      <StockMovementHistory productId={product.id} unit={product.unit} />
    </SubpageLayout>
  );
}
