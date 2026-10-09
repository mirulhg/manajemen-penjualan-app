import { HelpLink } from '../../help';
import { useParams } from 'react-router';

import { SubpageLayout } from '../../../components/layout/SubpageLayout';
import { useProduct } from '../api/use-product';
import { useCategoryNames } from '../api/use-categories';
import { useProducts } from '../api/use-products';
import { getUnits } from '../filter-products';
import { EditProductForm } from './EditProductForm';
import { NewProductSkeleton } from './NewProductSkeleton';
import { ProductNotFound } from './ProductNotFound';
import { StockListError } from './StockListError';
import { Card, CardContent } from '@/components/ui/card';

const HEADING = 'Ubah Barang';

export function EditProductPage() {
  const { productId = '' } = useParams();
  const product = useProduct(productId);
  // Produk dibutuhkan untuk saran satuan; kategori dari tabel kategori.
  const products = useProducts();
  const categories = useCategoryNames();
  const backTo = `/stok/${productId}`;
  const backLabel = 'Kembali ke detail barang';

  function handleRetry() {
    void product.refetch();
    void products.refetch();
    void categories.refetch();
  }

  if (product.isPending || products.isPending || categories.isPending) {
    return (
      <SubpageLayout title={HEADING} heading={HEADING} action={<HelpLink topic="ubah-barang" />} back={{ to: backTo, label: backLabel }}>
        <NewProductSkeleton />
      </SubpageLayout>
    );
  }

  if (product.isError || products.isError || categories.isError) {
    const error = product.error ?? products.error ?? categories.error;
    return (
      <SubpageLayout title={HEADING} heading={HEADING} action={<HelpLink topic="ubah-barang" />} back={{ to: backTo, label: backLabel }}>
        {error && <StockListError error={error} onRetry={handleRetry} />}
      </SubpageLayout>
    );
  }

  if (!product.data) {
    return (
      <SubpageLayout title="Barang tidak ditemukan" heading={HEADING} action={<HelpLink topic="ubah-barang" />} back={{ to: '/stok', label: 'Kembali ke daftar stok' }}>
        <ProductNotFound />
      </SubpageLayout>
    );
  }

  return (
    <SubpageLayout title={`Ubah ${product.data.name}`} heading={HEADING} action={<HelpLink topic="ubah-barang" />} back={{ to: backTo, label: backLabel }}>
      <Card>
        <CardContent>
          <EditProductForm
            product={product.data}
            categories={categories.data}
            units={getUnits(products.data)}
          />
        </CardContent>
      </Card>
    </SubpageLayout>
  );
}
