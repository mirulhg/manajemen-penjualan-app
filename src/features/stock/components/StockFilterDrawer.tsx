import type { StockFilters as StockFiltersValue } from '../parse-filter-params';
import { StockFilterFields } from './StockFilterFields';
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

type StockFilterDrawerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  filters: StockFiltersValue;
  categories: string[];
  onChange: (patch: Partial<StockFiltersValue>) => void;
  onClear: (() => void) | null;
};

// Filter berlaku langsung lewat URL; "Selesai" hanya menutup panel. onClear null = tidak ada filter yang bisa dihapus.
export function StockFilterDrawer({ isOpen, onOpenChange, filters, categories, onChange, onClear }: StockFilterDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filter</DrawerTitle>
          <DrawerDescription className="sr-only">Saring dan urutkan daftar barang.</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          <StockFilterFields filters={filters} categories={categories} onChange={onChange} />
        </div>
        <DrawerFooter className="pb-safe">
          {onClear && (
            <Button type="button" variant="outline" onClick={onClear}>
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
