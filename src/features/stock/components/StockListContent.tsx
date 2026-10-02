import { formatNumber } from '../../../utils/format-number';
import { useProducts } from '../api/use-products';
import { filterProducts, getCategories, normalizeFilters } from '../filter-products';
import { useStockFilters } from '../hooks/use-stock-filters';
import { StockEmptyState } from './StockEmptyState';
import { StockFilters } from './StockFilters';
import { StockList } from './StockList';
import { StockListError } from './StockListError';
import { StockListSkeleton } from './StockListSkeleton';
import { StockNoResults } from './StockNoResults';

export function StockListContent() {
  const { data: products, isPending, error, refetch } = useProducts();
  const { filters: urlFilters, setFilters, clearFilters } = useStockFilters();

  function handleRetry() {
    void refetch();
  }

  if (isPending) return <StockListSkeleton />;
  if (error) return <StockListError error={error} onRetry={handleRetry} />;
  if (products.length === 0) return <StockEmptyState />;

  const categories = getCategories(products);
  const filters = normalizeFilters(urlFilters, categories);
  const hasActiveFilters =
    filters.query !== null || filters.category !== null || filters.status !== null;
  const visibleProducts = filterProducts(products, filters);

  return (
    <div className="space-y-4">
      <StockFilters
        filters={filters}
        categories={categories}
        hasActiveFilters={hasActiveFilters}
        onChange={setFilters}
        onClear={clearFilters}
      />
      <p aria-live="polite" className="text-sm text-text-muted">
        Menampilkan {formatNumber(visibleProducts.length)} dari {formatNumber(products.length)}{' '}
        barang
      </p>
      {visibleProducts.length === 0 ? (
        <StockNoResults query={filters.query} onClear={clearFilters} />
      ) : (
        <StockList products={visibleProducts} />
      )}
    </div>
  );
}
