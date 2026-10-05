import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormField } from '../../../components/ui/FormField';
import { CategoryError } from '../api/category-error';
import { useCreateCategory } from '../api/use-category-mutations';
import { categoryNameSchema } from '../schema';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
          <Input type="text" autoComplete="off" className="mt-1" {...control} {...register('name')} />
        )}
      </FormField>
      {hasSaved && (
        <Alert variant="success" role="status" className="p-3">
          Kategori {mutation.data.name} ditambahkan.
        </Alert>
      )}
      {hasUnexpectedError && (
        <Alert variant="destructive" className="p-3">
          Penyimpanan di perangkat ini gagal. Isian Anda masih ada; coba simpan lagi.
        </Alert>
      )}
      <Button size="lg" type="submit" disabled={isSaving}>
        {isSaving ? 'Menyimpan…' : 'Tambah kategori'}
      </Button>
    </form>
  );
}
