type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};


import { Button } from '@/components/ui/button';

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: PaginationProps) {
  return (
    <nav aria-label="Halaman riwayat" className="flex items-center justify-between gap-4">
      <Button type="button" variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Sebelumnya
      </Button>
      <p className="text-sm text-muted-foreground">
        Halaman {page} dari {pageCount}
      </p>
      <Button type="button" variant="outline" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
        Berikutnya
      </Button>
    </nav>
  );
}
