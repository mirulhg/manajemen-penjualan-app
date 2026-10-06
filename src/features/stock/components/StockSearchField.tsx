import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type StockSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function StockSearchField({ value, onChange }: StockSearchFieldProps) {
  return (
    <div>
      <Label htmlFor="stock-search" className="sr-only">
        Cari barang
      </Label>
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="stock-search"
          type="search"
          placeholder="Cari nama atau SKU"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
