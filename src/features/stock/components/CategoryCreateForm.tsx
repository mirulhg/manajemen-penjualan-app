import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
  const hasUnexpectedError = mutation.isError && !(mutation.error instanceof CategoryError);

  // Dipanggil hanya bila skema lolos; teks mentah dikirim ke API, yang memvalidasi ulang dengan skema yang sama.
  async function onSubmit() {
    try {
      const created = await mutation.mutateAsync(getValues().name);
      reset({ name: '' });
      toast.success(`Kategori ${created.name} ditambahkan`);
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
