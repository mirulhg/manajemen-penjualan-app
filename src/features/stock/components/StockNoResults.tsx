type StockNoResultsProps = {
  query: string | null;
  onClear: () => void;
};

export function StockNoResults({ query, onClear }: StockNoResultsProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Tidak ada barang yang cocok</h2>
      <p className="mt-2 text-text-muted">
        {query
          ? `Tidak ada barang untuk kata kunci “${query.trim()}” dengan filter yang dipilih.`
          : 'Tidak ada barang dengan filter yang dipilih.'}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 min-h-11 rounded-md border border-border bg-surface px-4 font-medium"
      >
        Hapus filter
      </button>
    </div>
  );
}
