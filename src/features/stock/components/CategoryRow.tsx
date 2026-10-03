import { useRef, useState } from 'react';

import { formatNumber } from '../../../utils/format-number';
import type { CategoryWithCounts } from '../api/get-categories';
import { CategoryDeleteSection } from './CategoryDeleteSection';
import { CategoryRenameForm } from './CategoryRenameForm';

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
      <p className="text-sm text-text-muted">
        {formatNumber(category.activeCount)} barang aktif
        {category.archivedCount > 0 && ` · ${formatNumber(category.archivedCount)} diarsipkan`}
      </p>
      <div className="mt-2 flex flex-wrap items-start gap-3">
        <button
          ref={renameButtonRef}
          type="button"
          aria-expanded={isRenaming}
          onClick={handleOpenRename}
          className="min-h-11 rounded-md border border-border bg-surface px-4 font-medium"
        >
          Ubah nama
        </button>
        <CategoryDeleteSection category={category} />
      </div>
      {isRenaming && (
        <CategoryRenameForm category={category} onDone={handleCloseRename} onCancel={handleCloseRename} />
      )}
    </li>
  );
}
