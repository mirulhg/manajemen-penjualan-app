import { formatNumber } from '../../../utils/format-number';
import { useSession } from '../../session';
import { useCategoryNames } from '../api/use-categories';
import { useProducts } from '../api/use-products';
import { filterProducts, normalizeFilters } from '../filter-products';
import { useStockFilters } from '../hooks/use-stock-filters';
import { useStockThreshold } from '../hooks/use-stock-threshold';
import { sortProducts } from '../sort-products';
import { StockEmptyState } from './StockEmptyState';
import { StockFilters } from './StockFilters';
import { StockList } from './StockList';
import { StockListError } from './StockListError';
import { StockListSkeleton } from './StockListSkeleton';
import { StockNoResults } from './StockNoResults';
import { StockSummary } from './StockSummary';

export function StockListContent() {
  const productsQuery = useProducts();
  const categoriesQuery = useCategoryNames();
  const { data: products } = productsQuery;
  const { data: categories } = categoriesQuery;
  const error = productsQuery.error ?? categoriesQuery.error;
  const { isCashierMode } = useSession();
  const defaultMinStock = useStockThreshold();
  const { filters: urlFilters, setFilters, clearFilters } = useStockFilters();

  function handleRetry() {
    void productsQuery.refetch();
    void categoriesQuery.refetch();
  }

  if (error) return <StockListError error={error} onRetry={handleRetry} />;
  if (!products || !categories) return <StockListSkeleton />;
  if (products.length === 0) return <StockEmptyState />;

  const filters = normalizeFilters(urlFilters, categories);
  const hasActiveFilters =
    filters.query !== null || filters.category !== null || filters.status !== null || filters.archived;
  const activeProducts = products.filter((product) => product.archivedAt === null);
  // Pembanding "dari Y barang": semua barang bila arsip ditampilkan, kalau tidak hanya yang aktif.
  const scopeCount = filters.archived ? products.length : activeProducts.length;
  const visibleProducts = sortProducts(filterProducts(products, filters, defaultMinStock), filters.sort);

  return (
    <div className="space-y-4">
      {!isCashierMode && <StockSummary products={activeProducts} />}
      <StockFilters
        filters={filters}
        categories={categories}
        hasActiveFilters={hasActiveFilters}
        onChange={setFilters}
        onClear={clearFilters}
      />
      <p aria-live="polite" className="text-sm text-muted-foreground">
        Menampilkan {formatNumber(visibleProducts.length)} dari {formatNumber(scopeCount)}{' '}
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
