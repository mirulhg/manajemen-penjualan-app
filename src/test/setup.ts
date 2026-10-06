import 'fake-indexeddb/auto';

import { installMatchMedia } from './viewport';

// Berkas test non-komponen berjalan di environment node, tanpa window.
if (typeof window !== 'undefined') {
  installMatchMedia();
  // jsdom tidak mengimplementasikan pointer capture; Vaul memakainya saat drawer disentuh.
  Element.prototype.setPointerCapture = () => undefined;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.hasPointerCapture = () => false;
}
