import { DailySummaryCard } from '../../alerts';
import { DashboardContent } from './DashboardContent';

export function DashboardPage() {
  return (
    <section>
      <title>Dasbor · Manajemen Stok</title>
      <h1 className="mb-4 text-xl font-semibold">Dasbor</h1>
      <DailySummaryCard />
      <DashboardContent />
    </section>
  );
}
