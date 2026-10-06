import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type SkeletonProps = {
  // Teks untuk pembaca layar; selalu ada, walau bentuk skeleton belum tampil.
  label: string;
  children: ReactNode;
};

// IndexedDB lokal biasanya menjawab < 100ms; tanpa jeda ini skeleton hanya berkedip.
const SKELETON_DELAY_MS = 300;

export function Skeleton({ label, children }: SkeletonProps) {
  const [isShapeVisible, setIsShapeVisible] = useState(false);

  // Menunggu timer browser sebelum bentuk skeleton ditampilkan.
  useEffect(() => {
    const timerId = setTimeout(() => setIsShapeVisible(true), SKELETON_DELAY_MS);
    return () => clearTimeout(timerId);
  }, []);

  return (
    <div>
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
