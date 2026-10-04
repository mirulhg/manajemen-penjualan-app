import type { ReactNode } from 'react';

type ChartSectionProps = {
  title: string;
  isPending: boolean;
  error: Error | null;
  isEmpty: boolean;
  onRetry: () => void;
  children: ReactNode;
};

// Kerangka tiap grafik: judul, lalu salah satu dari skeleton, error, kosong, atau isi.
export function ChartSection({ title, isPending, error, isEmpty, onRetry, children }: ChartSectionProps) {
  const headingId = `${title.replace(/\s+/g, '-').toLowerCase()}-heading`;

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <h2 id={headingId} className="text-lg font-semibold">
        {title}
      </h2>
      <ChartSectionBody isPending={isPending} error={error} isEmpty={isEmpty} onRetry={onRetry}>
        {children}
      </ChartSectionBody>
    </section>
  );
}

type ChartSectionBodyProps = Omit<ChartSectionProps, 'title'>;

function ChartSectionBody({ isPending, error, isEmpty, onRetry, children }: ChartSectionBodyProps) {
  if (isPending) return <ChartSkeleton />;
  if (error) {
    return (
      <div role="alert">
        <p className="text-text-muted">
          Grafik gagal dibaca dari penyimpanan di perangkat ini. Coba lagi; jika masih gagal, muat ulang halaman.
        </p>
        <p className="mt-2 rounded-md border border-border bg-surface p-3 text-sm">{error.message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 min-h-11 rounded-md bg-primary px-4 font-medium text-on-primary"
        >
          Coba lagi
        </button>
      </div>
    );
  }
  if (isEmpty) return <p className="text-text-muted">Belum ada penjualan di periode ini.</p>;
  return children;
}

export function ChartSkeleton() {
  return (
    <div>
      <p className="sr-only" role="status">
        Memuat grafik
      </p>
      <div aria-hidden="true" className="h-52 rounded-md border border-border bg-surface" />
    </div>
  );
}
