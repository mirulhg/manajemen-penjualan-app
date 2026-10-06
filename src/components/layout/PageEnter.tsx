import { animate } from 'motion/mini';
import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';

import { DURATION, EASE_OUT } from '@/lib/motion';

type PageEnterProps = {
  children: ReactNode;
};

const ENTER_SHIFT_PX = 8;
const ENTER_DURATION = 0.25;
const STAGGER_SECONDS = 0.04;
const MAX_STAGGERED_BLOCKS = 6;
// Kasir tetap CSS saja (CLAUDE.md §7): halamannya dipakai berulang kali sehari.
const CASHIER_PATH = '/kasir';

// Halaman biasanya satu elemen akar yang membungkus blok-bloknya; blok tingkat atas adalah anak akar itu.
function findBlocks(wrapper: HTMLElement): Element[] {
  const [onlyChild] = wrapper.children;
  const container = wrapper.children.length === 1 && onlyChild ? onlyChild : wrapper;
  return Array.from(container.children);
}

function PageBlocks({ children }: PageEnterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Menyinkronkan elemen DOM halaman yang baru dipasang dengan animasi WAAPI; sebelum cat agar blok tidak berkedip tampil penuh dulu.
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    // Tanpa Web Animations API (browser lama), halaman tampil langsung.
    if (!wrapper || typeof wrapper.animate !== 'function') return;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const keyframes = isReducedMotion
      ? { opacity: [0, 1] }
      : { opacity: [0, 1], transform: [`translateY(${ENTER_SHIFT_PX}px)`, 'none'] };

    const playbacks = findBlocks(wrapper).map((block, index) =>
      animate(block, keyframes, {
        duration: isReducedMotion ? DURATION.fast : ENTER_DURATION,
        ease: EASE_OUT,
        delay: Math.min(index, MAX_STAGGERED_BLOCKS - 1) * STAGGER_SECONDS,
      }),
    );
    return () => playbacks.forEach((playback) => playback.stop());
  }, []);

  return <div ref={wrapperRef}>{children}</div>;
}

// Ber-key pathname: animasi hanya diputar saat halaman dibuka, bukan saat filter atau data berubah. Tanpa animasi keluar agar pindah halaman tidak tertunda.
export function PageEnter({ children }: PageEnterProps) {
  const { pathname } = useLocation();
  if (pathname === CASHIER_PATH) return children;
  return <PageBlocks key={pathname}>{children}</PageBlocks>;
}
