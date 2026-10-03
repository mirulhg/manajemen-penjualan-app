type CategoryErrorCode = 'DUPLICATE_CATEGORY' | 'NO_CHANGE' | 'CATEGORY_NOT_FOUND' | 'CATEGORY_NOT_EMPTY';

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
            ? `Masih dipakai ${usageCount} barang (termasuk yang diarsipkan).`
            : 'Kategori tidak ditemukan.',
    );
    this.name = 'CategoryError';
    this.code = code;
    this.usageCount = usageCount;
  }
}
