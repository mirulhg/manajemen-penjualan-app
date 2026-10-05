import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { SessionError } from '../api/session-error';
import { useExitCashierMode } from '../api/use-session-mutations';
import { describeSessionError } from '../describe-session-error';
import { PinField } from './PinField';
import { Alert } from '@/components/ui/alert';

const exitSchema = z.object({ pin: z.string().min(1, 'Isi PIN.') });

export function ExitWithPinForm() {
  const { register, handleSubmit, setError, getValues, formState } = useForm<z.input<typeof exitSchema>>({
    resolver: zodResolver(exitSchema),
    defaultValues: { pin: '' },
  });
  const mutation = useExitCashierMode();
  const isSaving = formState.isSubmitting || mutation.isPending;
  const hasUnexpectedError = mutation.isError && !(mutation.error instanceof SessionError);

  // Sukses: mode berubah dan halaman ini mengarahkan ke daftar stok.
  async function onSubmit() {
    try {
      await mutation.mutateAsync(getValues().pin);
    } catch (error) {
      const message = describeSessionError(error);
      if (message) setError('pin', { message });
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-3">
      <PinField id="exit-pin" label="PIN pemilik" error={formState.errors.pin?.message} registration={register('pin')} />
      {hasUnexpectedError && (
        <Alert variant="destructive" className="p-3">
          Penyimpanan di perangkat ini gagal. Coba lagi.
        </Alert>
      )}
      <button type="submit" disabled={isSaving} className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground">
        {isSaving ? 'Memeriksa…' : 'Keluar Mode Kasir'}
      </button>
    </form>
  );
}
