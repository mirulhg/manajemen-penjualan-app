import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { SessionError } from '../api/session-error';
import { useSetupPin } from '../api/use-session-mutations';
import { newPinSchema } from '../schema';
import { PinField } from './PinField';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type PinSetupFormProps = {
  onCreated: (recoveryCode: string) => void;
};

type PinSetupInput = z.input<typeof newPinSchema>;

export function PinSetupForm({ onCreated }: PinSetupFormProps) {
  const { register, handleSubmit, setError, getValues, formState } = useForm<
    PinSetupInput,
    unknown,
    z.output<typeof newPinSchema>
  >({ resolver: zodResolver(newPinSchema), defaultValues: { newPin: '', confirmPin: '' } });
  const mutation = useSetupPin();
  const isSaving = formState.isSubmitting || mutation.isPending;
  const hasUnexpectedError = mutation.isError && !(mutation.error instanceof SessionError);

  // Dipanggil hanya bila skema lolos; teks mentah dikirim ke API, yang memvalidasi ulang.
  async function onSubmit() {
    try {
      onCreated(await mutation.mutateAsync(getValues().newPin));
    } catch (error) {
      if (error instanceof SessionError) setError('newPin', { message: error.message });
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-3">
      <PinField
        id="new-pin"
        label="PIN baru"
        hint="4–6 angka."
        error={formState.errors.newPin?.message}
        registration={register('newPin')}
      />
      <PinField
        id="confirm-pin"
        label="Isi ulang PIN"
        error={formState.errors.confirmPin?.message}
        registration={register('confirmPin')}
      />
      {hasUnexpectedError && (
        <Alert variant="destructive" className="p-3">
          Penyimpanan di perangkat ini gagal. Coba simpan lagi.
        </Alert>
      )}
      <Button size="lg" type="submit" disabled={isSaving}>
        {isSaving ? 'Menyimpan…' : 'Buat PIN'}
      </Button>
    </form>
  );
}
