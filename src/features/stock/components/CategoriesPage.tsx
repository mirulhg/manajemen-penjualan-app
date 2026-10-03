import { SubpageLayout } from '../../../components/layout/SubpageLayout';
import { useCategories } from '../api/use-categories';
import { CategoriesSkeleton } from './CategoriesSkeleton';
import { CategoryCreateForm } from './CategoryCreateForm';
import { CategoryList } from './CategoryList';
import { StockListError } from './StockListError';

function CategoriesContent() {
  const { data: categories, isPending, error, refetch } = useCategories();

  function handleRetry() {
    void refetch();
  }

  if (isPending) return <CategoriesSkeleton />;
  if (error) return <StockListError error={error} onRetry={handleRetry} />;
  if (categories.length === 0) {
    return <p className="text-text-muted">Belum ada kategori. Tambahkan kategori pertama di atas.</p>;
  }

  return <CategoryList categories={categories} />;
}

export function CategoriesPage() {
  return (
    <SubpageLayout title="Kategori" heading="Kategori" backTo="/stok" backLabel="Kembali ke daftar stok">
      <div className="space-y-6">
        <CategoryCreateForm />
        <CategoriesContent />
      </div>
    </SubpageLayout>
  );
}
