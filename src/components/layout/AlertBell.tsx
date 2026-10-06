import { Bell } from 'lucide-react';
import { Link } from 'react-router';

import { Badge } from '@/components/ui/badge';

type AlertBellProps = {
  count: number;
  href: string;
};

const MAX_VISIBLE_COUNT = 99;

// Tanpa pengetahuan domain: hanya menampilkan jumlah dan tujuan tautan. Teks tersembunyi untuk pembaca layar.
export function AlertBell({ count, href }: AlertBellProps) {
  return (
    <Link to={href} className="press relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-foreground hover:bg-secondary">
      <Bell aria-hidden="true" className="size-6" />
      {count > 0 && (
        <Badge variant="accent" aria-hidden="true" className="absolute right-0 top-1 min-w-5 px-1 font-semibold">
          {count > MAX_VISIBLE_COUNT ? `${MAX_VISIBLE_COUNT}+` : count}
        </Badge>
      )}
      <span className="sr-only">Peringatan stok, {count} belum dibaca</span>
    </Link>
  );
}
