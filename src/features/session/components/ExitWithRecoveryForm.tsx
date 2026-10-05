import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormField } from '../../../components/ui/FormField';
import { SessionError } from '../api/session-error';
import { useExitCashierMode, useResetPin } from '../api/use-session-mutations';
import { describeSessionError } from '../describe-session-error';
import { newPinSchema } from '../schema';
import { PinField } from './PinField';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

type ExitWithRecoveryFormProps = {
  onRecovered: (newRecoveryCode: string) => void;
};

const recoverySchema = z.object({ code: z.string().trim().min(1, 'Isi kode pemulihan.') }).and(newPinSchema);
type RecoveryInput = z.input<typeof recoverySchema>;

export function ExitWithRecoveryForm({ onRecovered }: ExitWithRecoveryFormProps) {
  const { register, handleSubmit, setError, getValues, formState } = useForm<
    RecoveryInput,
    unknown,
    z.output<typeof recoverySchema>
  >({ resolver: zodResolver(recoverySchema), defaultValues: { code: '', newPin: '', confirmPin: '' } });
  const reset = useResetPin();
  const exit = useExitCashierMode();
  const isSaving = formState.isSubmitting || reset.isPending || exit.isPending;
  const failure = reset.error ?? exit.error;
  const hasUnexpectedError = failure !== null && !(failure instanceof SessionError);

  // Kode baru diteruskan sebelum keluar mode: begitu mode berubah, halaman ini sudah berpindah.
  async function onSubmit() {
    const { code, newPin } = getValues();
    try {
      onRecovered(await reset.mutateAsync({ code, newPin }));
      await exit.mutateAsync(newPin);
    } catch (error) {
      const message = describeSessionError(error);
      if (message) setError(error instanceof SessionError && error.code === 'INVALID_PIN_FORMAT' ? 'newPin' : 'code', { message });
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-3">
      <FormField id="recovery-code" label="Kode pemulihan" error={formState.errors.code?.message}>
        {(control) => (
          <Input type="text" autoComplete="off" className="mt-1" {...control} {...register('code')} />
        )}
      </FormField>
      <PinField id="new-pin" label="PIN baru" hint="4–6 angka." error={formState.errors.newPin?.message} registration={register('newPin')} />
      <PinField id="confirm-pin" label="Isi ulang PIN baru" error={formState.errors.confirmPin?.message} registration={register('confirmPin')} />
      {hasUnexpectedError && (
        <Alert variant="destructive" className="p-3">
          Penyimpanan di perangkat ini gagal. Coba lagi.
        </Alert>
      )}
      <button type="submit" disabled={isSaving} className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground">
        {isSaving ? 'Memeriksa…' : 'Pulihkan dan keluar'}
      </button>
    </form>
  );
}
