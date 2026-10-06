import { useEffect, useState } from 'react';

import { createBezierEasing, parseCubicBezier } from '../../../utils/cubic-bezier';
import type { BezierPoints } from '../../../utils/cubic-bezier';
import { parseCssTime } from '../../../utils/parse-css-time';

// Sama dengan --duration-count dan --ease-in-out di theme.css; hanya dipakai bila token tidak terbaca (mis. di jsdom).
// ease-in-out, bukan ease-out: ease-out menempuh >60% angka di seperempat waktu pertama, sehingga durasinya terasa jauh lebih pendek.
const FALLBACK_DURATION_MS = 700;
const FALLBACK_EASE: BezierPoints = [0.77, 0, 0.175, 1];

// Durasi dan kurva dibaca dari token CSS supaya satu sumber nilai (CLAUDE.md §7).
function readMotionTokens() {
  const styles = getComputedStyle(document.documentElement);
  const duration = parseCssTime(styles.getPropertyValue('--duration-count'));
  return {
    duration: Number.isFinite(duration) ? duration : FALLBACK_DURATION_MS,
    ease: createBezierEasing(parseCubicBezier(styles.getPropertyValue('--ease-in-out')) ?? FALLBACK_EASE),
  };
}

// Berhitung dari 0 ke target hanya sekali, saat komponen pertama dipasang dengan shouldPlay = true. "Dikunci" di awal:
// prop yang berubah sesudahnya (periode diganti, data diperbarui) tidak memutar ulang, angka langsung mengikuti target.
export function useCountUp(target: number, shouldPlay: boolean): { value: number; isPlaying: boolean } {
  const [isPlaying, setIsPlaying] = useState(shouldPlay);
  const [progress, setProgress] = useState(0);

  // Sinkron dengan jam frame browser (requestAnimationFrame), sistem di luar React; dibersihkan bila komponen dilepas.
  useEffect(() => {
    if (!isPlaying) return;
    const { duration, ease } = readMotionTokens();
    const start = performance.now();
    let frame = 0;

    function tick(now: number) {
      const elapsed = Math.min((now - start) / duration, 1);
      setProgress(ease(elapsed));
      if (elapsed < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setIsPlaying(false);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  return { value: isPlaying ? Math.round(target * progress) : target, isPlaying };
}
