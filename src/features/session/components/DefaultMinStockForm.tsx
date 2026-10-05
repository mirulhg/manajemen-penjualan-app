import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import { useSetDefaultMinStock } from '../api/use-session-mutations';
import { defaultMinStockSchema } from '../schema';
import type { DefaultMinStockInput } from '../schema';
import { useSession } from '../session-context';

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
          <input {...control} {...register('defaultMinStock')} type="text" inputMode="numeric" className={FIELD_CLASS} />
        )}
      </FormField>
      {hasSaved && (
        <p role="status" className="rounded-md bg-status-aman-bg p-3 text-status-aman-text">
          Tersimpan. Status stok dan peringatan sudah diperbarui.
        </p>
      )}
      {mutation.isError && (
        <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          Penyimpanan di perangkat ini gagal. Isian tidak hilang; coba simpan lagi.
        </p>
      )}
      <button type="submit" disabled={isSaving} className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground">
        {isSaving ? 'Menyimpan…' : 'Simpan batas'}
      </button>
    </form>
  );
}
