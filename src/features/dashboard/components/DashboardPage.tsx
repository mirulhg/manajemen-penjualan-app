import { BentoGrid } from '../../../components/ui/BentoGrid';
import { DailySummaryCard } from '../../alerts';
import { DashboardContent } from './DashboardContent';
import { DashboardHeader } from './DashboardHeader';

export function DashboardPage() {
  return (
    <section>
      <title>Dasbor · Manajemen Stok</title>
      <DashboardHeader />
      {/* group/bento: KPI dan kartu restock saling menyesuaikan lewat :has() (restock ditutup = KPI satu baris). */}
      <BentoGrid className="group/bento md:grid-cols-2 md:gap-4 lg:grid-cols-4">
        <DailySummaryCard />
        <DashboardContent />
      </BentoGrid>
    </section>
  );
}
