import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';
import { formatRupiah } from '../../../utils/format-rupiah';
import { SaleActionError } from '../api/sale-action-error';
import { useReturnSaleItems } from '../api/use-return-sale-items';
import { calculateReturn } from '../sale-returns';
import type { SaleItemProgress } from '../sale-returns';
import { buildReturnFormSchema } from '../schema';
import type { ReturnFormInput, ReturnFormValues } from '../schema';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type ReturnFormProps = {
  saleId: string;
  progress: SaleItemProgress[];
};

export function ReturnForm({ saleId, progress }: ReturnFormProps) {
  const emptyForm: ReturnFormInput = {
    items: progress.map((entry) => ({ saleItemId: entry.item.id, quantity: '' })),
    reason: '',
  };
  const remaining = progress.map((entry) => entry.remaining);
  const { register, handleSubmit, control, reset, setError, formState } = useForm<
    ReturnFormInput,
    unknown,
    ReturnFormValues
  >({ resolver: zodResolver(buildReturnFormSchema(remaining)), defaultValues: emptyForm });
  const mutation = useReturnSaleItems(saleId);

  const typed = useWatch({ control, name: 'items' });
  const preview = calculateReturn(
    progress,
    typed.flatMap((line) => (/^\d+$/.test(line.quantity) ? [{ saleItemId: line.saleItemId, quantity: Number(line.quantity) }] : [])),
  );
  const isSaving = formState.isSubmitting || mutation.isPending;
  const hasSaved = mutation.isSuccess && !formState.isDirty;
  const hasUnexpectedError = mutation.isError && !(mutation.error instanceof SaleActionError);
  const buttonLabel = isSaving ? 'Menyimpan…' : hasSaved ? 'Tersimpan' : 'Simpan retur';

  async function onSubmit(values: ReturnFormValues) {
    try {
      await mutation.mutateAsync({
        items: values.items.filter((line) => line.quantity > 0),
        reason: values.reason,
      });
      reset(emptyForm);
    } catch (error) {
      const index = progress.findIndex((entry) => entry.item.id === (error instanceof SaleActionError ? error.saleItemId : null));
      if (error instanceof SaleActionError && index >= 0) {
        setError(`items.${index}.quantity`, { message: error.message });
      }
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
      {progress.map((entry, index) =>
        entry.remaining > 0 ? (
          <FormField
            key={entry.item.id}
            id={`return-qty-${index}`}
            label={`Jumlah retur ${entry.item.productName} (sisa ${entry.remaining} ${entry.item.unit})`}
            error={formState.errors.items?.[index]?.quantity?.message}
          >
            {(controlProps) => (
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                className="mt-1"
                {...controlProps}
                {...register(`items.${index}.quantity`)}
              />
            )}
          </FormField>
        ) : null,
      )}
      {formState.errors.items?.root?.message && (
        <p role="alert" className="text-sm text-destructive">
          {formState.errors.items.root.message}
        </p>
      )}
      <FormField id="return-reason" label="Alasan retur" error={formState.errors.reason?.message}>
        {(controlProps) => (
          <textarea rows={2} className={FIELD_CLASS} {...controlProps} {...register('reason')} />
        )}
      </FormField>
      {preview.refundTotal > 0 && (
        <p className="text-lg font-semibold">Uang dikembalikan {formatRupiah(preview.refundTotal)}</p>
      )}
      {hasSaved && (
        <Alert variant="success" role="status" className="p-3">
          Tersimpan. Retur {mutation.data.number} sebesar {formatRupiah(mutation.data.refundTotal)} dicatat.
        </Alert>
      )}
      {hasUnexpectedError && (
        <Alert variant="destructive" className="p-3">
          Retur tidak tersimpan. Isian Anda masih ada; periksa lalu coba simpan lagi.
        </Alert>
      )}
      <Button size="lg" className="w-full sm:w-auto" type="submit" disabled={isSaving}>
        {buttonLabel}
      </Button>
    </form>
  );
}
