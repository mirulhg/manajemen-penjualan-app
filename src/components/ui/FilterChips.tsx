import { X } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';

import { CHIP_MOTION } from '@/lib/motion';

export type FilterChip<Patch> = { key: string; text: string; removeLabel: string; patch: Patch };

type FilterChipsProps<Patch> = {
  chips: FilterChip<Patch>[];
  onRemove: (patch: Patch) => void;
};

export function FilterChips<Patch>({ chips, onRemove }: FilterChipsProps<Patch>) {
  return (
    <AnimatePresence initial={false}>
      {chips.length > 0 && (
        <m.ul key="chips" exit={{ opacity: 0 }} aria-label="Filter aktif" className="flex flex-wrap gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {chips.map((chip) => (
              <m.li key={chip.key} {...CHIP_MOTION}>
                <button
                  type="button"
                  aria-label={chip.removeLabel}
                  onClick={() => onRemove(chip.patch)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-secondary pl-4 pr-3 text-sm font-medium hover:bg-muted"
                >
                  {chip.text}
                  <X aria-hidden="true" className="size-4" />
                </button>
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      )}
    </AnimatePresence>
  );
}
