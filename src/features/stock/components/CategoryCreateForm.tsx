import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import { CategoryError } from '../api/category-error';
import { useCreateCategory } from '../api/use-category-mutations';
import { categoryNameSchema } from '../schema';

const createCategoryFormSchema = z.object({ name: categoryNameSchema });
type CreateCategoryFormInput = z.input<typeof createCategoryFormSchema>;

export function CategoryCreateForm() {
  const { register, handleSubmit, reset, setError, setFocus, getValues, formState } = useForm<
    CreateCategoryFormInput,
    unknown,
    z.output<typeof createCategoryFormSchema>
  >({ resolver: zodResolver(createCategoryFormSchema), defaultValues: { name: '' } });
  const mutation = useCreateCategory();

  const isSaving = formState.isSubmitting || mutation.isPending;
  const hasSaved = mutation.isSuccess && !formState.isDirty;
  const hasUnexpectedError = mutation.isError && !(mutation.error instanceof CategoryError);

  // Dipanggil hanya bila skema lolos; teks mentah dikirim ke API, yang memvalidasi ulang dengan skema yang sama.
  async function onSubmit() {
    try {
      await mutation.mutateAsync(getValues().name);
      reset({ name: '' });
      setFocus('name');
    } catch (error) {
      if (error instanceof CategoryError) {
        setError('name', { message: error.message });
      }
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-3">
      <FormField id="category-name" label="Kategori baru" error={formState.errors.name?.message}>
        {(control) => (
          <input type="text" autoComplete="off" className={FIELD_CLASS} {...control} {...register('name')} />
        )}
      </FormField>
      {hasSaved && (
        <p role="status" className="rounded-md bg-status-aman-bg p-3 text-status-aman-text">
          Kategori {mutation.data.name} ditambahkan.
        </p>
      )}
      {hasUnexpectedError && (
        <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          Penyimpanan di perangkat ini gagal. Isian Anda masih ada; coba simpan lagi.
        </p>
      )}
      <button
        type="submit"
        disabled={isSaving}
        className="min-h-11 rounded-md bg-primary px-4 font-medium text-on-primary"
      >
        {isSaving ? 'Menyimpan…' : 'Tambah kategori'}
      </button>
    </form>
  );
}
