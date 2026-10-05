import { useRef, useState } from 'react';

import { formatNumber } from '../../../utils/format-number';
import type { CategoryWithCounts } from '../api/get-categories';
import { CategoryDeleteSection } from './CategoryDeleteSection';
import { CategoryRenameForm } from './CategoryRenameForm';
import { Button } from '@/components/ui/button';

type CategoryRowProps = {
  category: CategoryWithCounts;
};

export function CategoryRow({ category }: CategoryRowProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const renameButtonRef = useRef<HTMLButtonElement>(null);

  // Tombol "Ubah nama" tetap terpasang selama form terbuka, jadi fokus bisa langsung dikembalikan.
  function handleCloseRename() {
    setIsRenaming(false);
    renameButtonRef.current?.focus();
  }

  function handleOpenRename() {
    setIsRenaming(true);
  }

  return (
    <li className="border-b border-border px-4 py-3 last:border-b-0">
      <p className="font-medium">{category.name}</p>
      <p className="text-sm text-muted-foreground">
        {formatNumber(category.activeCount)} barang aktif
        {category.archivedCount > 0 && ` · ${formatNumber(category.archivedCount)} diarsipkan`}
      </p>
      <div className="mt-2 flex flex-wrap items-start gap-3">
        <Button variant="outline" ref={renameButtonRef} type="button" aria-expanded={isRenaming} onClick={handleOpenRename}>
          Ubah nama
        </Button>
        <CategoryDeleteSection category={category} />
      </div>
      {isRenaming && (
        <CategoryRenameForm category={category} onDone={handleCloseRename} onCancel={handleCloseRename} />
      )}
    </li>
  );
}
