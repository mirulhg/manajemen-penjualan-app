import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DrawerTrigger } from '@/components/ui/drawer';

type PayBarProps = {
  itemCount: number;
  total: number;
  isVisible: boolean;
};

// Selalu ter-render supaya masuk dan keluarnya bisa berupa transisi (bisa disela), bukan pasang-cabut. Keluar: inert agar tidak bisa difokus.
// Harus dirender di dalam <Drawer>: tombol Bayar adalah DrawerTrigger.
export function PayBar({ itemCount, total, isVisible }: PayBarProps) {
  return (
    <div
      inert={!isVisible}
      className={cn(
        'fixed inset-x-0 bottom-tabbar z-sticky border-t border-border bg-card px-4 py-3 transition-[transform,opacity] duration-(--duration-base) ease-out md:bottom-0 print:hidden',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <p className="min-w-0 flex-1 truncate font-semibold">
          {formatNumber(itemCount)} barang · {formatRupiah(total)}
        </p>
        <DrawerTrigger asChild>
          <Button type="button" variant="accent" size="lg">
            Bayar
          </Button>
        </DrawerTrigger>
      </div>
    </div>
  );
}
