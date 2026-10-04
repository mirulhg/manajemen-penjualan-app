import { useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';

import { indexFromPointer } from './chart-scale';

// Satu penunjuk aktif per grafik: pointer (mouse/sentuh) dan keyboard mengendalikan indeks yang sama.
export function useChartCursor(count: number, mode: 'point' | 'band') {
  const [active, setActive] = useState<number | null>(null);

  function move(delta: number) {
    setActive((current) => Math.min(count - 1, Math.max(0, (current ?? 0) + delta)));
  }

  function handleKeyDown(event: KeyboardEvent) {
    const actions: Record<string, () => void> = {
      ArrowRight: () => move(1),
      ArrowDown: () => move(1),
      ArrowLeft: () => move(-1),
      ArrowUp: () => move(-1),
      Home: () => setActive(0),
      End: () => setActive(count - 1),
      Escape: () => setActive(null),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }

  function handlePointer(event: PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setActive(indexFromPointer(event.clientX - rect.left, rect.width, count, mode));
  }

  function handlePointerLeave(event: PointerEvent<HTMLElement>) {
    // Sentuhan dibiarkan: penunjuk tetap terlihat sampai fokus berpindah.
    if (event.pointerType === 'mouse') setActive(null);
  }

  return {
    active,
    setActive,
    containerProps: {
      tabIndex: 0,
      onKeyDown: handleKeyDown,
      onFocus: () => setActive((current) => current ?? 0),
      onBlur: () => setActive(null),
    },
    pointerProps: {
      onPointerMove: handlePointer,
      onPointerDown: handlePointer,
      onPointerLeave: handlePointerLeave,
    },
  };
}
