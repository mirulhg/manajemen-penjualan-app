import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';

type ChartSectionProps = {
  title: string;
  isPending: boolean;
  error: Error | null;
  isEmpty: boolean;
  onRetry: () => void;
  // Kontrol kartu (mis. skala waktu), tampil di kanan judul.
  action?: ReactNode;
  children: ReactNode;
};

// Kerangka tiap grafik: judul, lalu salah satu dari skeleton, error, kosong, atau isi.
export function ChartSection({ title, isPending, error, isEmpty, onRetry, action, children }: ChartSectionProps) {
  const headingId = `${title.replace(/\s+/g, '-').toLowerCase()}-heading`;

  return (
    // md ke atas: kartu bento yang mengisi tinggi selnya. Di HP tetap bagian polos seperti sebelumnya.
    <section
      aria-labelledby={headingId}
      className="space-y-3 md:flex md:h-full md:flex-col md:rounded-md md:border md:border-border md:bg-card md:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId} className="text-lg font-semibold">
          {title}
        </h2>
        {action}
      </div>
      <ChartSectionBody isPending={isPending} error={error} isEmpty={isEmpty} onRetry={onRetry}>
        {children}
      </ChartSectionBody>
    </section>
  );
}

type ChartSectionBodyProps = Omit<ChartSectionProps, 'title' | 'action'>;

function ChartSectionBody({ isPending, error, isEmpty, onRetry, children }: ChartSectionBodyProps) {
  if (isPending) return <ChartSkeleton />;
  if (error) {
    return (
      <div role="alert">
        <p className="text-muted-foreground">
          Grafik gagal dibaca dari penyimpanan di perangkat ini. Coba lagi; jika masih gagal, muat ulang halaman.
        </p>
        <p className="mt-2 rounded-md border border-border bg-card p-3 text-sm">{error.message}</p>
        <Button size="lg" className="mt-3" type="button" onClick={onRetry}>
          Coba lagi
        </Button>
      </div>
    );
  }
  if (isEmpty) return <p className="text-muted-foreground">Belum ada penjualan di periode ini.</p>;
  return children;
}

export function ChartSkeleton() {
  return (
    <Skeleton label="Memuat grafik">
      <div className="h-52 rounded-md border border-border skeleton-bar" />
    </Skeleton>
  );
}
