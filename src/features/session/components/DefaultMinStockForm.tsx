import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import { useSetDefaultMinStock } from '../api/use-session-mutations';
import { defaultMinStockSchema } from '../schema';
import type { DefaultMinStockInput } from '../schema';
import { useSession } from '../session-context';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

export function DefaultMinStockForm() {
  const { defaultMinStock } = useSession();
  const { register, handleSubmit, reset, formState } = useForm<DefaultMinStockInput, unknown, { defaultMinStock: number }>({
    resolver: zodResolver(defaultMinStockSchema),
    defaultValues: { defaultMinStock: String(defaultMinStock) },
  });
  const mutation = useSetDefaultMinStock();
  const isSaving = formState.isSubmitting || mutation.isPending;
  const hasSaved = mutation.isSuccess && !formState.isDirty;

  async function onSubmit(values: { defaultMinStock: number }) {
    await mutation.mutateAsync(values.defaultMinStock);
    // Isian dianggap bersih setelah tersimpan, supaya pesan "Tersimpan" muncul sampai diubah lagi.
    reset({ defaultMinStock: String(values.defaultMinStock) });
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-3">
      <FormField
        id="default-min-stock"
        label="Batas menipis default"
        hint="Dipakai barang yang tidak punya batas sendiri. Stok sampai batas ini dianggap menipis."
        error={formState.errors.defaultMinStock?.message}
      >
        {(control) => (
          <Input {...control} {...register('defaultMinStock')} type="text" inputMode="numeric" className="mt-1" />
        )}
      </FormField>
      {hasSaved && (
        <Alert variant="success" role="status" className="p-3">
          Tersimpan. Status stok dan peringatan sudah diperbarui.
        </Alert>
      )}
      {mutation.isError && (
        <Alert variant="destructive" className="p-3">
          Penyimpanan di perangkat ini gagal. Isian tidak hilang; coba simpan lagi.
        </Alert>
      )}
      <button type="submit" disabled={isSaving} className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground">
        {isSaving ? 'Menyimpan…' : 'Simpan batas'}
      </button>
    </form>
  );
}
