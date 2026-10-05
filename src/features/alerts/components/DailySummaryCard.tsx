import { Link } from 'react-router';

import { toLocalDateText } from '../../../utils/date-period';
import { formatNumber } from '../../../utils/format-number';
import { formatRupiah } from '../../../utils/format-rupiah';
import { useDismissDailySummary, useSession } from '../../session';
import { useDailySummary } from '../api/use-daily-summary';

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
  if (isPending) return <div aria-hidden="true" className="mb-6 h-24 rounded-md border border-border bg-card" />;
  if (error) {
    return (
      <div role="alert" className="mb-6 rounded-md border border-border bg-card p-4">
        <p>Ringkasan harian gagal dibaca. </p>
        <button type="button" onClick={handleRetry} className="min-h-11 font-medium text-primary underline">
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <section aria-labelledby="daily-summary-heading" className="mb-6 space-y-2 rounded-md border border-border bg-card p-4">
      <h2 id="daily-summary-heading" className="font-semibold">
        Ringkasan hari ini
      </h2>
      <p>
        Barang habis {formatNumber(data.soldOut)} · menipis {formatNumber(data.low)}
      </p>
      <p className="text-muted-foreground">
        Kemarin: omzet {formatRupiah(data.yesterday.revenue)} dari {formatNumber(data.yesterday.transactionCount)} transaksi
      </p>
      <div className="flex flex-wrap items-center gap-x-4">
        <Link to="/peringatan" className="inline-flex min-h-11 items-center font-medium text-primary underline">
          Lihat daftar perlu restock
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          disabled={dismiss.isPending}
          className="min-h-11 font-medium text-primary underline"
        >
          Tutup untuk hari ini
        </button>
      </div>
    </section>
  );
}
