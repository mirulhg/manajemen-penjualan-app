import { useParams } from 'react-router';

import { SubpageLayout } from '../../../components/layout/SubpageLayout';
import { useProduct } from '../api/use-product';
import { useProducts } from '../api/use-products';
import { getCategories, getUnits } from '../filter-products';
import { EditProductForm } from './EditProductForm';
import { NewProductSkeleton } from './NewProductSkeleton';
import { ProductNotFound } from './ProductNotFound';
import { StockListError } from './StockListError';

const HEADING = 'Ubah Barang';

export function EditProductPage() {
  const { productId = '' } = useParams();
  const product = useProduct(productId);
  // Daftar produk dibutuhkan untuk saran kategori dan satuan.
  const products = useProducts();
  const backTo = `/stok/${productId}`;
  const backLabel = 'Kembali ke detail barang';

  function handleRetry() {
    void product.refetch();
    void products.refetch();
  }

  if (product.isPending || products.isPending) {
    return (
      <SubpageLayout title={HEADING} heading={HEADING} backTo={backTo} backLabel={backLabel}>
        <NewProductSkeleton />
      </SubpageLayout>
    );
  }

  if (product.isError || products.isError) {
    const error = product.error ?? products.error;
    return (
      <SubpageLayout title={HEADING} heading={HEADING} backTo={backTo} backLabel={backLabel}>
        {error && <StockListError error={error} onRetry={handleRetry} />}
      </SubpageLayout>
    );
  }

  if (!product.data) {
    return (
      <SubpageLayout title="Barang tidak ditemukan" heading={HEADING} backTo="/stok" backLabel="Kembali ke daftar stok">
        <ProductNotFound />
      </SubpageLayout>
    );
  }

  return (
    <SubpageLayout title={`Ubah ${product.data.name}`} heading={HEADING} backTo={backTo} backLabel={backLabel}>
      <EditProductForm
        product={product.data}
        categories={getCategories(products.data)}
        units={getUnits(products.data)}
      />
    </SubpageLayout>
  );
}
