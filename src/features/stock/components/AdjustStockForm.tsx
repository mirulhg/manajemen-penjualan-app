import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { getAdjustmentPreview } from '../adjustment-preview';
import { StockAdjustmentError } from '../api/adjust-stock';
import { useAdjustStock } from '../api/use-adjust-stock';
import { stockAdjustmentSchema } from '../schema';
import type { Product, StockAdjustment, StockAdjustmentInput } from '../schema';
import { formatNumber } from '../../../utils/format-number';
import { AdjustQuantityField } from './AdjustQuantityField';
import { AdjustReasonField } from './AdjustReasonField';
import { AdjustStockPreview } from './AdjustStockPreview';
import { AdjustTypeFieldset } from './AdjustTypeFieldset';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type AdjustStockFormProps = {
  product: Product;
};

const EMPTY_FORM: StockAdjustmentInput = { type: 'masuk', quantity: '', reason: '' };

export function AdjustStockForm({ product }: AdjustStockFormProps) {
  const { register, handleSubmit, control, reset, setError, formState } = useForm<
    StockAdjustmentInput,
    unknown,
    StockAdjustment
  >({ resolver: zodResolver(stockAdjustmentSchema), defaultValues: EMPTY_FORM });
  const mutation = useAdjustStock(product.id);

  const type = useWatch({ control, name: 'type' });
  const quantityText = useWatch({ control, name: 'quantity' });
  const preview = getAdjustmentPreview(type, product.stockQuantity, quantityText);
  const quantityLabel = type === 'masuk' ? 'Jumlah diterima' : 'Jumlah hasil hitung';
  const isSaving = formState.isSubmitting || mutation.isPending;
  const hasSaved = mutation.isSuccess && !formState.isDirty;
  const hasUnexpectedError = mutation.isError && !(mutation.error instanceof StockAdjustmentError);
  const buttonLabel = isSaving ? 'Menyimpan…' : hasSaved ? 'Tersimpan' : 'Simpan penyesuaian';

  async function onSubmit(adjustment: StockAdjustment) {
    try {
      const updated = await mutation.mutateAsync({ ...adjustment, quantity: String(adjustment.quantity) });
      reset(EMPTY_FORM);
      toast.success(`Stok ${updated.name} sekarang ${formatNumber(updated.stockQuantity)} ${updated.unit}`);
    } catch (error) {
      if (error instanceof StockAdjustmentError && error.code === 'NO_CHANGE') {
        setError('quantity', {
          message: `Hasil hitung sama dengan stok sekarang (${formatNumber(error.currentQuantity ?? 0)}). Tidak ada yang perlu dikoreksi.`,
        });
      }
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
      <AdjustTypeFieldset register={register} />
      <AdjustQuantityField
        register={register}
        label={quantityLabel}
        unit={product.unit}
        error={formState.errors.quantity?.message}
      />
      <div aria-live="polite">
        {preview && <AdjustStockPreview {...preview} unit={product.unit} />}
      </div>
      <AdjustReasonField register={register} error={formState.errors.reason?.message} />
      {hasUnexpectedError && (
        <Alert variant="destructive" className="p-3">
          Penyimpanan di perangkat ini gagal. Isian Anda masih ada; coba simpan lagi.
        </Alert>
      )}
      <Button size="lg" className="w-full sm:w-auto" type="submit" disabled={isSaving}>
        {buttonLabel}
      </Button>
    </form>
  );
}
