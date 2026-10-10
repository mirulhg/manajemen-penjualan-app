import type { HelpBlock, HelpListItem } from '../types';
import { RichText } from '@/components/ui/RichText';

type HelpBlocksProps = {
  // Sudah disaring menurut mode oleh pemanggil (filterSections).
  blocks: readonly HelpBlock[];
};

function ItemList({ items, isOrdered }: { items: readonly HelpListItem[]; isOrdered: boolean }) {
  const Tag = isOrdered ? 'ol' : 'ul';
  return (
    <Tag className={isOrdered ? 'list-decimal space-y-2 pl-6' : 'list-disc space-y-2 pl-6'}>
      {items.map((item) => (
        <li key={item.text}>
          <RichText text={item.text} />
          {item.children && (
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {item.children.map((child) => (
                <li key={child}>
                  <RichText text={child} />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </Tag>
  );
}

function BlockView({ block }: { block: HelpBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p>
          <RichText text={block.text} />
        </p>
      );
    case 'steps':
      return <ItemList items={block.items} isOrdered />;
    case 'list':
      return <ItemList items={block.items} isOrdered={false} />;
    case 'table':
      return (
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary">
              <tr>
                {block.columns.map((column) => (
                  <th key={column} scope="col" className="px-3 py-2 font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.cells[0]} className="border-t border-border align-top">
                  {row.cells.map((cell, index) => (
                    <td key={cell} className={index === 1 ? 'min-w-56 px-3 py-2' : 'min-w-32 px-3 py-2'}>
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'faq':
      return (
        <div className="space-y-5">
          {block.items.map((item) => (
            <div key={item.question} className="space-y-2">
              <h3 className="font-semibold">{item.question}</h3>
              <HelpBlocks blocks={item.answer} />
            </div>
          ))}
        </div>
      );
  }
}

export function HelpBlocks({ blocks }: HelpBlocksProps) {
  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        // Urutan blok tetap; tidak ada penambahan atau penghapusan saat dirender.
        <BlockView key={index} block={block} />
      ))}
    </div>
  );
}
