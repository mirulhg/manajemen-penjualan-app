import 'fake-indexeddb/auto';

import { MotionGlobalConfig } from 'motion/react';

import { installMatchMedia } from './viewport';

// Test tidak boleh bergantung pada waktu animasi.
MotionGlobalConfig.skipAnimations = true;

// Berkas test non-komponen berjalan di environment node, tanpa window.
if (typeof window !== 'undefined') {
  installMatchMedia();
  // jsdom tidak mengimplementasikan pointer capture; Vaul memakainya saat drawer disentuh.
  Element.prototype.setPointerCapture = () => undefined;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.hasPointerCapture = () => false;
  // cmdk (palette perintah) memakai keduanya; jsdom tidak mengimplementasikannya.
  Element.prototype.scrollIntoView = () => undefined;
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
