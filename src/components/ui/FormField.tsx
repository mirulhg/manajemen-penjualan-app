import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';

type FieldControlProps = {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': true | undefined;
};

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error: string | undefined;
  children: (control: FieldControlProps) => ReactNode;
};

export function FormField({ id, label, hint, error, children }: FormFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div>
      <Label htmlFor={id}>
        {label}
      </Label>
      {children({
        id,
        'aria-describedby': describedBy || undefined,
        'aria-invalid': error ? true : undefined,
      })}
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
