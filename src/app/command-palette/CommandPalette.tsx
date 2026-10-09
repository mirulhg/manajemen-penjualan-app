import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { useHelpSheet } from '../../features/help';
import { useLastMonthSalesDownload } from '../../features/reports';
import { markKeyboardInput } from '@/hooks/use-input-modality';
import { CommandDialog, CommandEmpty, CommandInput, CommandList } from '@/components/ui/command';
import { PaletteProductGroup } from './PaletteProductGroup';
import { PaletteRootItems } from './PaletteRootItems';

type CommandPaletteProps = {
  isOpen: boolean;
  // Dibuka dengan keyboard: tampil dan hilang seketika. Dibuka dengan ketukan/klik: memudar dan membesar sedikit.
  isAnimated: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // Radix hanya mengembalikan fokus ke pemicu Dialog; palette tidak punya pemicu, jadi pemilik yang mengembalikannya.
  onCloseAutoFocus: (event: Event) => void;
};

type PaletteStep = 'root' | 'restock';

export function CommandPalette({ isOpen, isAnimated, onOpenChange, onCloseAutoFocus }: CommandPaletteProps) {
  const navigate = useNavigate();
  const lastMonthSales = useLastMonthSalesDownload();
  const { open: openHelp } = useHelpSheet();
  const [step, setStep] = useState<PaletteStep>('root');
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleOpenChange(nextIsOpen: boolean) {
    onOpenChange(nextIsOpen);
    if (!nextIsOpen) {
      setStep('root');
      setQuery('');
    }
  }

  function handleNavigate(to: string) {
    handleOpenChange(false);
    markKeyboardInput();
    void navigate(to);
  }

  // Modal terbuka di halaman yang sedang dibuka; palette ditutup lebih dulu.
  function handleOpenHelp(slug: string) {
    handleOpenChange(false);
    markKeyboardInput();
    openHelp(slug);
  }

  function handleStartRestock() {
    setStep('restock');
    setQuery('');
    // Dipilih dengan klik/ketuk, fokus lepas dari kolom cari; kembalikan supaya bisa langsung mengetik dan Backspace.
    inputRef.current?.focus();
  }

  function handleDownloadLastMonthSales() {
    handleOpenChange(false);
    lastMonthSales.download((error) => {
      toast.error(`Laporan penjualan bulan lalu gagal dibuat: ${error.message}. Coba lagi dari menu Laporan.`);
    });
  }

  // Backspace di kolom kosong pada langkah kedua kembali ke daftar awal.
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && step === 'restock' && query === '') {
      event.preventDefault();
      setStep('root');
    }
  }

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      isAnimated={isAnimated}
      onCloseAutoFocus={onCloseAutoFocus}
      showCloseButton={false}
      title="Cari atau buka halaman"
      description="Ketik untuk mencari halaman, aksi, atau barang. Esc untuk menutup."
      className="top-4 translate-y-0 sm:top-16 sm:max-w-xl"
      shouldFilter={false}
    >
      <CommandInput
        ref={inputRef}
        value={query}
        onValueChange={setQuery}
        onKeyDown={handleKeyDown}
        placeholder={step === 'restock' ? 'Barang apa yang masuk? Ketik nama atau SKU' : 'Cari halaman, aksi, atau barang…'}
      />
      <CommandList>
        <CommandEmpty>{`Tidak ada hasil untuk '${query}'`}</CommandEmpty>
        {step === 'root' ? (
          <PaletteRootItems
            query={query}
            onNavigate={handleNavigate}
            onStartRestock={handleStartRestock}
            onOpenHelp={handleOpenHelp}
            onDownloadLastMonthSales={handleDownloadLastMonthSales}
          />
        ) : (
          <PaletteProductGroup query={query} heading="Pilih barang yang masuk" mode="restock" onNavigate={handleNavigate} />
        )}
      </CommandList>
    </CommandDialog>
  );
}
