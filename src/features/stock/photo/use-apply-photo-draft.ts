import type { PhotoDraft } from './photo-draft';
import { useRemoveProductPhoto, useSaveProductPhoto } from './use-product-photo-actions';

// Menyimpan pilihan foto setelah data barang berhasil tersimpan; kegagalannya terbaca lewat hasFailed.
export function useApplyPhotoDraft() {
  const save = useSaveProductPhoto();
  const remove = useRemoveProductPhoto();

  async function applyPhotoDraft(productId: string, draft: PhotoDraft) {
    if (draft.kind === 'replace') await save.mutateAsync({ productId, photo: draft.photo });
    if (draft.kind === 'remove') await remove.mutateAsync(productId);
  }

  return { applyPhotoDraft, hasFailed: save.isError || remove.isError };
}
