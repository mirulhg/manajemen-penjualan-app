import { Search } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

// cmdk dan dialog baru dimuat saat palette pertama kali dibuka, jadi bundle utama dan Kasir tidak bertambah.
const CommandPalette = lazy(() => import('./CommandPalette').then((module) => ({ default: module.CommandPalette })));

type OpenSource = 'keyboard' | 'pointer';

const IS_APPLE_PLATFORM = /Mac|iPhone|iPad/.test(navigator.userAgent);
const SHORTCUT_LABEL = IS_APPLE_PLATFORM ? '⌘K' : 'Ctrl K';

export function CommandPaletteTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [source, setSource] = useState<OpenSource>('pointer');
  const returnFocusRef = useRef<HTMLElement | null>(null);

  function open(nextSource: OpenSource) {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSource(nextSource);
    setHasOpened(true);
    setIsOpen(true);
  }

  function handleCloseAutoFocus(event: Event) {
    event.preventDefault();
    returnFocusRef.current?.focus();
  }

  function handlePointerOpen() {
    open('pointer');
  }

  // Pintasan global di window, sistem di luar React. Dilewati saat Drawer terbuka agar Drawer tidak tertimpa.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (!isShortcut) return;
      event.preventDefault();
      if (document.querySelector('[data-slot="drawer-content"]')) return;
      open('keyboard');
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Button type="button" variant="ghost" onClick={handlePointerOpen} aria-label="Cari atau buka halaman" className="min-h-11 min-w-11 px-0 lg:hidden print:hidden">
        <Search aria-hidden="true" className="size-6" />
      </Button>
      <Button type="button" variant="outline" onClick={handlePointerOpen} className="hidden gap-3 lg:inline-flex print:hidden">
        <Search aria-hidden="true" />
        Cari…
        <kbd className="text-xs text-muted-foreground">{SHORTCUT_LABEL}</kbd>
      </Button>
      {hasOpened && (
        <Suspense fallback={null}>
          <CommandPalette isOpen={isOpen} isAnimated={source === 'pointer'} onOpenChange={setIsOpen} onCloseAutoFocus={handleCloseAutoFocus} />
        </Suspense>
      )}
    </>
  );
}
