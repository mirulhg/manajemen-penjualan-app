import type { ReactNode } from 'react';

import { STAGGER_CHILDREN_ATTRIBUTE } from '@/lib/motion';
import { cn } from '@/lib/utils';

type BentoGridProps = {
  // Kolom dan penempatan sel ditentukan halaman pemakai; komponen ini hanya grid + penanda stagger.
  className?: string;
  children: ReactNode;
};

const STAGGER_ATTRIBUTES = { [STAGGER_CHILDREN_ATTRIBUTE]: '' };

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div {...STAGGER_ATTRIBUTES} className={cn('grid gap-6', className)}>
      {children}
    </div>
  );
}
