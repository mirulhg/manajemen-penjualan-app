import { Link } from 'react-router';

type AlertBellProps = {
  count: number;
  href: string;
};

const MAX_VISIBLE_COUNT = 99;

// Tanpa pengetahuan domain: hanya menampilkan jumlah dan tujuan tautan. Teks tersembunyi untuk pembaca layar.
export function AlertBell({ count, href }: AlertBellProps) {
  return (
    <Link to={href} className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-foreground">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 fill-current">
        <path d="M12 3a6 6 0 0 0-6 6v3.5L4.5 15v1h15v-1L18 12.5V9a6 6 0 0 0-6-6Zm-2 15a2 2 0 0 0 4 0Z" />
      </svg>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-0 top-1 min-w-5 rounded-full bg-primary px-1 text-center text-xs font-semibold text-primary-foreground"
        >
          {count > MAX_VISIBLE_COUNT ? `${MAX_VISIBLE_COUNT}+` : count}
        </span>
      )}
      <span className="sr-only">Peringatan stok, {count} belum dibaca</span>
    </Link>
  );
}
