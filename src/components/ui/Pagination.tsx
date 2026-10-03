type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

const BUTTON_CLASS = 'min-h-11 rounded-md border border-border bg-surface px-4 font-medium';

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: PaginationProps) {
  return (
    <nav aria-label="Halaman riwayat" className="flex items-center justify-between gap-4">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={BUTTON_CLASS}
      >
        Sebelumnya
      </button>
      <p className="text-sm text-text-muted">
        Halaman {page} dari {pageCount}
      </p>
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className={BUTTON_CLASS}
      >
        Berikutnya
      </button>
    </nav>
  );
}
