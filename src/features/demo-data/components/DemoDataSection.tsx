import { SectionCard } from '../../../components/ui/SectionCard';
import { LoadDemoDataButton } from './LoadDemoDataButton';

export function DemoDataSection() {
  return (
    <SectionCard
      id="demo-data-heading"
      title="Data contoh"
      description="Isi aplikasi dengan 20 barang dan 60 hari transaksi contoh (termasuk retur dan batal) untuk mencoba semua fitur."
    >
      <LoadDemoDataButton />
    </SectionCard>
  );
}
