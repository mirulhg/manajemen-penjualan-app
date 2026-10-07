import { animate } from 'motion/mini';
import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';

import { getInputModality } from '@/hooks/use-input-modality';
import { DURATION, EASE_OUT, STAGGER_CHILDREN_ATTRIBUTE } from '@/lib/motion';

type PageEnterProps = {
  children: ReactNode;
};

const ENTER_SHIFT_PX = 8;
const ENTER_DURATION = 0.25;
const STAGGER_SECONDS = 0.04;
const MAX_STAGGERED_BLOCKS = 6;
// Data lokal tiba beberapa puluh ms setelah halaman dipasang; konten yang tiba dalam jendela ini ikut masuk, yang lebih lambat muncul biasa.
const ARRIVAL_WINDOW_MS = 600;
// Kasir tetap CSS saja (CLAUDE.md §7): halamannya dipakai berulang kali sehari.
const CASHIER_PATH = '/kasir';

// Halaman biasanya satu elemen akar yang membungkus blok-bloknya; blok tingkat atas adalah anak akar itu.
function findContainer(wrapper: HTMLElement): Element {
  const [onlyChild] = wrapper.children;
  return wrapper.children.length === 1 && onlyChild ? onlyChild : wrapper;
}

function expandBlocks(elements: Element[]): Element[] {
  return elements.flatMap((element) =>
    element.hasAttribute(STAGGER_CHILDREN_ATTRIBUTE) ? Array.from(element.children) : [element],
  );
}

function playEnter(blocks: Element[], isReducedMotion: boolean) {
  const keyframes = isReducedMotion
    ? { opacity: [0, 1] }
    : { opacity: [0, 1], transform: [`translateY(${ENTER_SHIFT_PX}px)`, 'none'] };

  return blocks.map((block, index) =>
    animate(block, keyframes, {
      duration: isReducedMotion ? DURATION.fast : ENTER_DURATION,
      ease: EASE_OUT,
      delay: Math.min(index, MAX_STAGGERED_BLOCKS - 1) * STAGGER_SECONDS,
    }),
  );
}

function PageBlocks({ children }: PageEnterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Menyinkronkan elemen DOM halaman dengan animasi WAAPI; sebelum cat agar blok tidak berkedip tampil penuh dulu.
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    // Tanpa Web Animations API (browser lama), halaman tampil langsung.
    if (!wrapper || typeof wrapper.animate !== 'function') return;
    // Pindah halaman lewat keyboard atau palette: tampil langsung tanpa gerak.
    if (getInputModality() === 'keyboard') return;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const container = findContainer(wrapper);
    const playbacks = playEnter(expandBlocks(Array.from(container.children)), isReducedMotion);

    const observer = new MutationObserver((records) => {
      const arrivals = records
        .filter((record) => record.target === container || (record.target instanceof Element && record.target.hasAttribute(STAGGER_CHILDREN_ATTRIBUTE)))
        .flatMap((record) => Array.from(record.addedNodes))
        .filter((node): node is Element => node instanceof Element);
      playbacks.push(...playEnter(expandBlocks(arrivals), isReducedMotion));
    });
    observer.observe(container, { childList: true, subtree: true });
    const stopObserving = setTimeout(() => observer.disconnect(), ARRIVAL_WINDOW_MS);

    return () => {
      clearTimeout(stopObserving);
      observer.disconnect();
      playbacks.forEach((playback) => playback.stop());
    };
  }, []);

  return <div ref={wrapperRef}>{children}</div>;
}

// Ber-key pathname: animasi hanya diputar saat halaman dibuka, bukan saat filter atau data berubah. Tanpa animasi keluar agar pindah halaman tidak tertunda.
export function PageEnter({ children }: PageEnterProps) {
  const { pathname } = useLocation();
  if (pathname === CASHIER_PATH) return children;
  return <PageBlocks key={pathname}>{children}</PageBlocks>;
}
