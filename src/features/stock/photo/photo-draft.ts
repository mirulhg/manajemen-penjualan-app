import type { CompressedPhoto } from './compress-photo';

// Pilihan foto yang belum disimpan: dipakai form tambah dan form ubah.
export type PhotoDraft =
  | { kind: 'unchanged' }
  | { kind: 'replace'; photo: CompressedPhoto }
  | { kind: 'remove' };

export const UNCHANGED_PHOTO: PhotoDraft = { kind: 'unchanged' };
