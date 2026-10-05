import { categoryUsageMessage } from '../api/category-error';
import type { CategoryWithCounts } from '../api/get-categories';
import { useDeleteCategory } from '../api/use-category-mutations';
import { Alert } from '@/components/ui/alert';

type CategoryDeleteSectionProps = {
  category: CategoryWithCounts;
};

const SUMMARY_CLASS = 'inline-flex min-h-11 cursor-pointer items-center font-medium text-primary';

// Konfirmasi lewat <details> bawaan browser (tanpa state), seperti arsip barang.
export function CategoryDeleteSection({ category }: CategoryDeleteSectionProps) {
  const mutation = useDeleteCategory();
  const usageCount = category.activeCount + category.archivedCount;
  const reasonId = `category-delete-reason-${category.id}`;

  function handleConfirm() {
    mutation.mutate(category.id);
  }

  if (usageCount > 0) {
    return (
      <div>
        <button
          type="button"
          disabled
          aria-describedby={reasonId}
          className="min-h-11 rounded-md border border-border px-4 font-medium text-muted-foreground"
        >
          Hapus
        </button>
        <p id={reasonId} className="text-sm text-muted-foreground">
          {categoryUsageMessage(usageCount)}
        </p>
      </div>
    );
  }

  return (
    <details className="rounded-md border border-border bg-card px-4">
      <summary className={SUMMARY_CLASS}>Hapus</summary>
      <div className="space-y-3 pb-4">
        <p>Kategori {category.name} akan dihapus dari daftar kategori.</p>
        {mutation.isError && (
          <Alert variant="destructive" className="p-3">
            {mutation.error.message}
          </Alert>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={mutation.isPending}
          className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground"
        >
          {mutation.isPending ? 'Menghapus…' : 'Ya, hapus'}
        </button>
      </div>
    </details>
  );
}
