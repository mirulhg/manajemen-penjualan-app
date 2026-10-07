import { ChevronRight, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router';

import { toLocalDateText } from '../../../utils/date-period';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import { useDismissDailySummary, useSession } from '../../session';
import { useDailySummary } from '../api/use-daily-summary';
import { Button } from '@/components/ui/button';

// Pengganti "satu notifikasi rangkuman setiap pagi" sampai ada push: muncul sekali per hari sampai ditutup.
export function DailySummaryCard() {
  const { dailySummaryEnabled, dailySummaryDismissedOn } = useSession();
  const { data, isPending, error, refetch } = useDailySummary();
  const dismiss = useDismissDailySummary();
  const today = toLocalDateText(new Date());

  function handleDismiss() {
    dismiss.mutate(today);
  }

  function handleRetry() {
    void refetch();
  }

  if (!dailySummaryEnabled || dailySummaryDismissedOn === today) return null;
  if (isPending) return <div data-slot="daily-summary" aria-hidden="true" className="h-24 rounded-md border border-border bg-card md:col-span-full lg:col-span-2 lg:row-span-2 lg:h-auto" />;
  if (error) {
    return (
      <div data-slot="daily-summary" role="alert" className="rounded-md border border-border bg-card p-4 md:col-span-full lg:col-span-2 lg:row-span-2">
        <p>Ringkasan harian gagal dibaca. </p>
        <Button size="lg" type="button" onClick={handleRetry}>
          Coba lagi
        </Button>
      </div>
    );
  }

  return (
    <section
      data-slot="daily-summary"
      aria-labelledby="daily-summary-heading"
      className="space-y-3 rounded-md bg-primary p-4 text-primary-foreground md:col-span-full lg:col-span-2 lg:row-span-2 lg:flex lg:flex-col lg:justify-between lg:space-y-0 lg:p-6"
    >
      <div className="space-y-3">
        <h2 id="daily-summary-heading" className="flex items-center gap-2 font-semibold text-accent">
          <TriangleAlert aria-hidden="true" className="size-5 shrink-0" />
          <span>
            {formatNumber(data.soldOut)} barang habis · {formatNumber(data.low)} menipis
          </span>
        </h2>
        <p className="text-sm text-primary-foreground/80">
          Kemarin: omzet {formatRupiah(data.yesterday.revenue)} dari {formatNumber(data.yesterday.transactionCount)} transaksi
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="secondary" className="bg-card hover:bg-card/90 focus-visible:outline-primary-foreground">
          <Link to="/peringatan">
            Lihat daftar restock
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={handleDismiss}
          disabled={dismiss.isPending}
          className="text-primary-foreground hover:bg-primary-foreground/10 focus-visible:outline-primary-foreground"
        >
          Tutup untuk hari ini
        </Button>
      </div>
    </section>
  );
}
