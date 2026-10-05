import type { UseFormRegisterReturn } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import { Input } from '@/components/ui/input';

type PinFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error: string | undefined;
  registration: UseFormRegisterReturn;
};

export function PinField({ id, label, hint, error, registration }: PinFieldProps) {
  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      {(control) => (
        <Input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          className="mt-1"
          {...control}
          {...registration}
        />
      )}
    </FormField>
  );
}
