type CategoryErrorCode = 'DUPLICATE_CATEGORY' | 'NO_CHANGE' | 'CATEGORY_NOT_FOUND' | 'CATEGORY_NOT_EMPTY';

export function categoryUsageMessage(usageCount: number): string {
  return `Masih dipakai ${usageCount} barang (termasuk yang diarsipkan).`;
}

export class CategoryError extends Error {
  readonly code: CategoryErrorCode;
  readonly usageCount: number;

  constructor(code: CategoryErrorCode, detail = '', usageCount = 0) {
    super(
      code === 'DUPLICATE_CATEGORY'
        ? `Kategori ${detail} sudah ada.`
        : code === 'NO_CHANGE'
          ? 'Nama kategori belum diubah.'
          : code === 'CATEGORY_NOT_EMPTY'
            ? categoryUsageMessage(usageCount)
            : 'Kategori tidak ditemukan.',
    );
    this.name = 'CategoryError';
    this.code = code;
    this.usageCount = usageCount;
  }
}
