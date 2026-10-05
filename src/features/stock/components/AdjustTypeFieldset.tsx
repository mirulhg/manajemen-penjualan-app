import type { UseFormRegister } from 'react-hook-form';

import type { StockAdjustmentInput } from '../schema';

type AdjustTypeFieldsetProps = {
  register: UseFormRegister<StockAdjustmentInput>;
};

const TYPE_OPTIONS = [
  { value: 'masuk', label: 'Stok masuk', description: 'Barang datang dari supplier' },
  { value: 'koreksi', label: 'Koreksi', description: 'Sesuaikan dengan hasil hitung fisik' },
] as const;

export function AdjustTypeFieldset({ register }: AdjustTypeFieldsetProps) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">Jenis penyesuaian</legend>
      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        {TYPE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex min-h-11 items-start gap-3 rounded-md border border-border bg-card p-3"
          >
            <input type="radio" value={option.value} className="mt-1" {...register('type')} />
            <span>
              <span className="block font-medium">{option.label}</span>
              <span className="block text-sm text-muted-foreground">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
