import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';

type ChartTableProps = {
  caption: string;
  headers: string[];
  rows: string[][];
};

// Alternatif aksesibel untuk setiap grafik, sekaligus cara melihat angka persisnya.
export function ChartTable({ caption, headers, rows }: ChartTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tableId = useId();

  function handleToggle() {
    setIsOpen((current) => !current);
  }

  return (
    <div className="mt-2">
      <Button type="button" variant="link" onClick={handleToggle} aria-expanded={isOpen} aria-controls={tableId}>
        {isOpen ? 'Sembunyikan tabel' : 'Tampilkan tabel'}
      </Button>
      <div id={tableId} hidden={!isOpen} className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border">
              {headers.map((header, index) => (
                <th key={header} scope="col" className={`px-2 py-2 font-medium ${index > 0 ? 'text-right' : ''}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells) => (
              <tr key={cells[0]} className="border-b border-border last:border-b-0">
                {cells.map((cell, index) => (
                  <td key={`${cells[0]}-${headers[index]}`} className={`px-2 py-2 ${index > 0 ? 'text-right' : ''}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
