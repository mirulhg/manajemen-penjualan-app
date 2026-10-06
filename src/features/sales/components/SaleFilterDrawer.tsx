import type { SaleFilters } from '../sale-filters';
import { SaleExtraFilterFields } from './SaleExtraFilterFields';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

type SaleFilterDrawerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  filters: SaleFilters;
  actors: string[];
  onChange: (patch: Partial<SaleFilters>) => void;
};

// Filter berlaku langsung lewat URL; "Selesai" hanya menutup panel.
export function SaleFilterDrawer({ isOpen, onOpenChange, filters, actors, onChange }: SaleFilterDrawerProps) {
  const hasExtraFilters = filters.method !== null || filters.actor !== null;

  function handleClear() {
    onChange({ method: null, actor: null });
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filter</DrawerTitle>
          <DrawerDescription className="sr-only">Saring transaksi menurut metode bayar dan kasir.</DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-4 overflow-y-auto px-4">
          <SaleExtraFilterFields filters={filters} actors={actors} onChange={onChange} />
        </div>
        <DrawerFooter className="pb-safe">
          {hasExtraFilters && (
            <Button type="button" variant="outline" onClick={handleClear}>
              Hapus filter
            </Button>
          )}
          <DrawerClose asChild>
            <Button type="button" size="lg">
              Selesai
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
