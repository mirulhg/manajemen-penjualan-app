import 'fake-indexeddb/auto';

import { installMatchMedia } from './viewport';

// Berkas test non-komponen berjalan di environment node, tanpa window.
if (typeof window !== 'undefined') {
  installMatchMedia();
}
