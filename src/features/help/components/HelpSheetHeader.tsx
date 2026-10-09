import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

type HelpSheetHeaderProps = {
  // Title dan Description milik Dialog atau Drawer, supaya nama dialog terbaca pembaca layar.
  title: ReactNode;
  description: ReactNode;
  onClose: () => void;
};

export function HelpSheetHeader({ title, description, onClose }: HelpSheetHeaderProps) {
  return (
    <div className="flex shrink-0 items-start gap-2 border-b border-border px-6 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">Bantuan</p>
        {title}
        {description}
      </div>
      <Button type="button" variant="ghost" size="icon" aria-label="Tutup" onClick={onClose} className="-mr-2 shrink-0">
        <X aria-hidden="true" />
      </Button>
    </div>
  );
}
