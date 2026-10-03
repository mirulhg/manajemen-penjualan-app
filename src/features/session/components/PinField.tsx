import type { UseFormRegisterReturn } from 'react-hook-form';

import { FormField } from '../../../components/ui/FormField';
import { FIELD_CLASS } from '../../../components/ui/field-styles';

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
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          className={FIELD_CLASS}
          {...control}
          {...registration}
        />
      )}
    </FormField>
  );
}
