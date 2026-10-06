import { useLocation } from 'react-router';

import { useCategoryNames } from '../api/use-categories';
import { useProducts } from '../api/use-products';
import { getUnits } from '../filter-products';
import { getListPath } from '../list-return-state';
import { NewProductForm } from './NewProductForm';
import { NewProductSkeleton } from './NewProductSkeleton';
import { StockListError } from './StockListError';
import { SubpageLayout } from '../../../components/layout/SubpageLayout';
import { Card, CardContent } from '@/components/ui/card';

export function NewProductPage() {
  const location = useLocation();
  // Produk dibutuhkan untuk saran satuan; kategori dari tabel kategori agar yang masih kosong ikut muncul.
  const products = useProducts();
  const categories = useCategoryNames();
  const backTo = getListPath(location.state);

  function handleRetry() {
    void products.refetch();
    void categories.refetch();
  }

  if (products.isPending || categories.isPending) {
    return (
      <SubpageLayout title="Tambah Barang" heading="Tambah Barang" backTo={backTo} backLabel="Kembali ke daftar stok">
        <NewProductSkeleton />
      </SubpageLayout>
    );
  }

  if (products.isError || categories.isError) {
    const error = products.error ?? categories.error;
    return (
      <SubpageLayout title="Tambah Barang" heading="Tambah Barang" backTo={backTo} backLabel="Kembali ke daftar stok">
        {error && <StockListError error={error} onRetry={handleRetry} />}
      </SubpageLayout>
    );
  }

  return (
    <SubpageLayout title="Tambah Barang" heading="Tambah Barang" backTo={backTo} backLabel="Kembali ke daftar stok">
      <Card>
        <CardContent>
          <NewProductForm categories={categories.data} units={getUnits(products.data)} />
        </CardContent>
      </Card>
    </SubpageLayout>
  );
}
