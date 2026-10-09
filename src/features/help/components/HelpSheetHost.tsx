import { lazy, Suspense } from 'react';
import { toast } from 'sonner';

import { useHelpSheet } from '../use-help-sheet';
import { HelpSheetBoundary } from './HelpSheetBoundary';

function createLazySheet() {
  return lazy(() => import('./HelpTopicSheet').then((module) => ({ default: module.HelpTopicSheet })));
}

// React.lazy menyimpan kegagalan selamanya; dibuat ulang setelah gagal supaya percobaan berikutnya mengunduh lagi.
let LazySheet = createLazySheet();

export function HelpSheetHost() {
  const { slug, close } = useHelpSheet();

  if (!slug) return null;

  function handleLoadError() {
    LazySheet = createLazySheet();
    toast.error('Panduan belum bisa dimuat. Periksa koneksi internet, lalu coba lagi.');
    close();
  }

  return (
    <HelpSheetBoundary key={slug} onError={handleLoadError}>
      <Suspense fallback={null}>
        <LazySheet slug={slug} />
      </Suspense>
    </HelpSheetBoundary>
  );
}
