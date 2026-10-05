import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import { useCancelSale } from '../api/use-cancel-sale';
import { cancelSaleInputSchema } from '../schema';

type CancelFormProps = {
  saleId: string;
  saleNumber: string;
};

type CancelFormValues = { reason: string };

export function CancelForm({ saleId, saleNumber }: CancelFormProps) {
  const { register, handleSubmit, formState } = useForm<CancelFormValues>({
    resolver: zodResolver(cancelSaleInputSchema),
    defaultValues: { reason: '' },
  });
  const mutation = useCancelSale(saleId);
  const isSaving = formState.isSubmitting || mutation.isPending;

  // Berhasil: detail dimuat ulang dan form ini hilang karena status berubah menjadi Dibatalkan.
  async function onSubmit(values: CancelFormValues) {
    try {
      await mutation.mutateAsync(values.reason);
    } catch {
      // Kegagalan ditampilkan lewat mutation.error di bawah; isian sengaja tidak dihapus.
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
      <p>
        Transaksi <strong>{saleNumber}</strong> akan dibatalkan dan stok barang yang belum diretur
        dikembalikan. Transaksi tidak dihapus dan pembatalan tidak bisa diurungkan.
      </p>
      <FormField id="cancel-reason" label="Alasan pembatalan" error={formState.errors.reason?.message}>
        {(controlProps) => (
          <textarea rows={2} className={FIELD_CLASS} {...controlProps} {...register('reason')} />
        )}
      </FormField>
      {mutation.isError && (
        <p role="alert" className="rounded-md bg-status-habis-bg p-3 text-status-habis-text">
          {mutation.error.message} Isian Anda masih ada; coba lagi.
        </p>
      )}
      <button
        type="submit"
        disabled={isSaving}
        className="min-h-11 w-full rounded-md bg-status-habis-text px-4 font-medium text-primary-foreground sm:w-auto"
      >
        {isSaving ? 'Membatalkan…' : 'Ya, batalkan'}
      </button>
    </form>
  );
}
