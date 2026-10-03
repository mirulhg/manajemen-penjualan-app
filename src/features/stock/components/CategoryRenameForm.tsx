import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import { CategoryError } from '../api/category-error';
import type { CategoryWithCounts } from '../api/get-categories';
import { useRenameCategory } from '../api/use-category-mutations';
import { categoryNameSchema } from '../schema';

type CategoryRenameFormProps = {
  category: CategoryWithCounts;
  onDone: () => void;
  onCancel: () => void;
};

const renameFormSchema = z.object({ name: categoryNameSchema });
type RenameFormInput = z.input<typeof renameFormSchema>;

export function CategoryRenameForm({ category, onDone, onCancel }: CategoryRenameFormProps) {
  const { register, handleSubmit, setError, getValues, formState } = useForm<
    RenameFormInput,
    unknown,
    z.output<typeof renameFormSchema>
  >({ resolver: zodResolver(renameFormSchema), defaultValues: { name: category.name } });
  const mutation = useRenameCategory();

  const isSaving = formState.isSubmitting || mutation.isPending;
  const hasUnexpectedError =
    mutation.isError &&
    !(mutation.error instanceof CategoryError && mutation.error.code !== 'CATEGORY_NOT_FOUND');

  // Dipanggil hanya bila skema lolos; teks mentah dikirim ke API, yang memvalidasi ulang dengan skema yang sama.
  async function onSubmit() {
    try {
      await mutation.mutateAsync({ id: category.id, name: getValues().name });
      onDone();
    } catch (error) {
      if (error instanceof CategoryError && error.code !== 'CATEGORY_NOT_FOUND') {
        setError('name', { message: error.message });
      }
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="mt-3 space-y-3">
      <FormField id={`category-rename-${category.id}`} label="Nama kategori" error={formState.errors.name?.message}>
        {(control) => (
          <input
            type="text"
            autoComplete="off"
            className={FIELD_CLASS}
            {...control}
            {...register('name')}
          />
        )}
      </FormField>
      {hasUnexpectedError && (
        <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          {mutation.error instanceof CategoryError
            ? mutation.error.message
            : 'Penyimpanan di perangkat ini gagal. Coba simpan lagi.'}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="min-h-11 rounded-md bg-primary px-4 font-medium text-on-primary"
        >
          {isSaving ? 'Menyimpan…' : 'Simpan'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-md border border-border bg-surface px-4 font-medium"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
