import { animate } from 'motion/mini';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { DURATION, EASE_OUT } from '@/lib/motion';

type SkeletonProps = {
  // Teks untuk pembaca layar; selalu ada, walau bentuk skeleton belum tampil.
  label: string;
  children: ReactNode;
};

// IndexedDB lokal biasanya menjawab < 100ms; tanpa jeda ini skeleton hanya berkedip.
const SKELETON_DELAY_MS = 300;

function addedElementsReplacing(records: MutationRecord[], wrapper: Element): Element[] {
  // Yang dilepas bisa wrapper ini sendiri atau induk yang memuatnya (mis. sel grid); pengganti dimasukkan ke target yang sama.
  const removal = records.find((record) => Array.from(record.removedNodes).some((node) => node.contains(wrapper)));
  if (!removal) return [];
  return records
    .filter((record) => record.target === removal.target)
    .flatMap((record) => Array.from(record.addedNodes))
    .filter((node): node is Element => node instanceof Element);
}

export function Skeleton({ label, children }: SkeletonProps) {
  const [isShapeVisible, setIsShapeVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Menunggu timer browser sebelum bentuk skeleton ditampilkan.
  useEffect(() => {
    const timerId = setTimeout(() => setIsShapeVisible(true), SKELETON_DELAY_MS);
    return () => clearTimeout(timerId);
  }, []);

  // Hanya bila skeleton sempat tampil: isi yang menggantikannya memudar masuk. Mengamati DOM (sistem di luar React) karena
  // pengganti dirender oleh komponen induk, bukan oleh Skeleton. Bila skeleton tidak sempat tampil, isi langsung muncul.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const root = wrapper?.closest('main') ?? document.body;
    if (!isShapeVisible || !wrapper || typeof wrapper.animate !== 'function') return;

    function fadeInReplacement(records: MutationRecord[]) {
      if (!wrapper) return;
      addedElementsReplacing(records, wrapper).forEach((element) => {
        animate(element, { opacity: [0, 1] }, { duration: DURATION.base, ease: EASE_OUT });
      });
    }

    const observer = new MutationObserver(fadeInReplacement);
    observer.observe(root, { childList: true, subtree: true });
    // Saat dilepas, catatan yang belum diproses tetap dikerjakan sebelum pengamat dihentikan.
    return () => {
      fadeInReplacement(observer.takeRecords());
      observer.disconnect();
    };
  }, [isShapeVisible]);

  return (
    <div ref={wrapperRef}>
      <p className="sr-only" role="status">
        {label}
      </p>
      {isShapeVisible && (
        <div aria-hidden="true" className="skeleton-fade">
          {children}
        </div>
      )}
    </div>
  );
}
