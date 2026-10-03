import { useLocation } from 'react-router';

import { useProducts } from '../api/use-products';
import { getCategories, getUnits } from '../filter-products';
import { getListPath } from '../list-return-state';
import { NewProductForm } from './NewProductForm';
import { NewProductSkeleton } from './NewProductSkeleton';
import { StockListError } from './StockListError';
import { SubpageLayout } from '../../../components/layout/SubpageLayout';

export function NewProductPage() {
  const location = useLocation();
  // Daftar produk dibutuhkan hanya untuk saran kategori dan satuan.
  const { data: products, isPending, error, refetch } = useProducts();
  const backTo = getListPath(location.state);

  function handleRetry() {
    void refetch();
  }

  if (isPending) {
    return (
      <SubpageLayout title="Tambah Barang" heading="Tambah Barang" backTo={backTo} backLabel="Kembali ke daftar stok">
        <NewProductSkeleton />
      </SubpageLayout>
    );
  }

  if (error) {
    return (
      <SubpageLayout title="Tambah Barang" heading="Tambah Barang" backTo={backTo} backLabel="Kembali ke daftar stok">
        <StockListError error={error} onRetry={handleRetry} />
      </SubpageLayout>
    );
  }

  return (
    <SubpageLayout title="Tambah Barang" heading="Tambah Barang" backTo={backTo} backLabel="Kembali ke daftar stok">
      <NewProductForm categories={getCategories(products)} units={getUnits(products)} />
    </SubpageLayout>
  );
}
