import { toast } from 'sonner';

import { categoryUsageMessage } from '../api/category-error';
import type { CategoryWithCounts } from '../api/get-categories';
import { useDeleteCategory } from '../api/use-category-mutations';
import { Alert } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';

type CategoryDeleteSectionProps = {
  category: CategoryWithCounts;
};

const SUMMARY_CLASS = buttonVariants({ variant: 'outline', className: 'cursor-pointer' });

// Konfirmasi lewat <details> bawaan browser (tanpa state), seperti arsip barang.
export function CategoryDeleteSection({ category }: CategoryDeleteSectionProps) {
  const mutation = useDeleteCategory();
  const usageCount = category.activeCount + category.archivedCount;
  const reasonId = `category-delete-reason-${category.id}`;

  // mutateAsync, bukan mutate: barisnya hilang dari daftar setelah sukses, dan callback mutate() tidak jalan bila komponen sudah dilepas.
  async function deleteCategory() {
    try {
      await mutation.mutateAsync(category.id);
      toast.success(`Kategori ${category.name} dihapus`);
    } catch {
      // Kegagalan ditampilkan lewat mutation.error di bawah.
    }
  }

  function handleConfirm() {
    void deleteCategory();
  }

  if (usageCount > 0) {
    return (
      <div>
        <Button variant="outline" className="text-muted-foreground" type="button" disabled aria-describedby={reasonId}>
          Hapus
        </Button>
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
        <Button size="lg" type="button" onClick={handleConfirm} disabled={mutation.isPending}>
          {mutation.isPending ? 'Menghapus…' : 'Ya, hapus'}
        </Button>
      </div>
    </details>
  );
}
