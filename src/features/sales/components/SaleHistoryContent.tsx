import { useSaleActors } from '../api/use-sale-actors';
import { useSaleFilters } from '../hooks/use-sale-filters';
import { SaleFilterBar } from './SaleFilterBar';
import { SaleHistoryResults } from './SaleHistoryResults';

export function SaleHistoryContent() {
  const { filters, setFilters } = useSaleFilters();
  const actors = useSaleActors();

  function handlePageChange(page: number) {
    setFilters({ page });
  }

  return (
    <div className="space-y-4">
      <SaleFilterBar filters={filters} actors={actors.data ?? []} onChange={setFilters} />
      <SaleHistoryResults filters={filters} onPageChange={handlePageChange} />
    </div>
  );
}
