import { HARIAN_CONTENT } from './content/harian';
import { HASIL_CONTENT } from './content/hasil';
import { ISTILAH_CONTENT } from './content/istilah';
import { MEMULAI_CONTENT } from './content/memulai';
import { MENGATUR_CONTENT } from './content/mengatur';
import type { HelpTopicSlug } from './help-topics';
import type { HelpSection } from './types';

// Berat, jadi hanya diimpor halaman Bantuan yang lazy. Tipe Record memastikan setiap topik punya isi.
export const HELP_CONTENT: Record<HelpTopicSlug, readonly HelpSection[]> = {
  ...MEMULAI_CONTENT,
  ...HARIAN_CONTENT,
  ...HASIL_CONTENT,
  ...MENGATUR_CONTENT,
  ...ISTILAH_CONTENT,
};
