import { Button } from '@/components/ui/button';
type StockNoResultsProps = {
  query: string | null;
  onClear: () => void;
};

export function StockNoResults({ query, onClear }: StockNoResultsProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Tidak ada barang yang cocok</h2>
      <p className="mt-2 text-muted-foreground">
        {query
          ? `Tidak ada barang untuk kata kunci “${query.trim()}” dengan filter yang dipilih.`
          : 'Tidak ada barang dengan filter yang dipilih.'}
      </p>
      <Button variant="outline" className="mt-4" type="button" onClick={onClear}>
        Hapus filter
      </Button>
    </div>
  );
}
