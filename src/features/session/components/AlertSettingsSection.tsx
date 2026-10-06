import { SectionCard } from '../../../components/ui/SectionCard';
import { useSession } from '../session-context';
import { AlertFlagToggle } from './AlertFlagToggle';
import { DefaultMinStockForm } from './DefaultMinStockForm';

export function AlertSettingsSection() {
  const { alertsBellEnabled, dailySummaryEnabled, alertsInCashierMode } = useSession();

  return (
    <SectionCard
      id="alerts-heading"
      title="Peringatan stok"
      description="Kapan barang dianggap menipis dan siapa yang diberi tahu."
    >
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
      <p className="text-sm text-muted-foreground">Jam tenang dan penerima: butuh akun online (fase berikutnya).</p>
    </SectionCard>
  );
}
