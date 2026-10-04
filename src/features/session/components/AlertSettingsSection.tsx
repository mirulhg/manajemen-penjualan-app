import { useSession } from '../session-context';
import { AlertFlagToggle } from './AlertFlagToggle';
import { DefaultMinStockForm } from './DefaultMinStockForm';

export function AlertSettingsSection() {
  const { alertsBellEnabled, dailySummaryEnabled, alertsInCashierMode } = useSession();

  return (
    <section aria-labelledby="alerts-heading" className="space-y-4">
      <h2 id="alerts-heading" className="text-lg font-semibold">
        Peringatan stok
      </h2>
      <DefaultMinStockForm />
      <AlertFlagToggle
        flag="alertsBellEnabled"
        checked={alertsBellEnabled}
        label="Tampilkan lonceng peringatan"
        description="Lonceng di header menunjukkan jumlah peringatan stok yang belum dibaca."
      />
      <AlertFlagToggle
        flag="dailySummaryEnabled"
        checked={dailySummaryEnabled}
        label="Tampilkan ringkasan harian di Dasbor"
        description="Kartu rangkuman stok dan penjualan kemarin, muncul sekali per hari sampai ditutup."
      />
      <AlertFlagToggle
        flag="alertsInCashierMode"
        checked={alertsInCashierMode}
        label="Tampilkan peringatan di Mode Kasir"
        description="Kasir bisa melihat daftar barang menipis, tetapi tidak melihat daftar perlu restock."
      />
      <p className="text-sm text-text-muted">Jam tenang dan penerima: butuh akun online (fase berikutnya).</p>
    </section>
  );
}
