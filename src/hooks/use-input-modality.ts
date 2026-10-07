import { useSyncExternalStore } from 'react';

import { INDICATOR_TRANSITION, INSTANT_TRANSITION } from '@/lib/motion';

type InputModality = 'keyboard' | 'pointer';

// Gerak hanya untuk ketukan/klik; aksi dari keyboard harus instan (CLAUDE.md §7). Nilai awal pointer: halaman yang baru dibuka/di-refresh boleh masuk dengan gerak.
let modality: InputModality = 'pointer';
const listeners = new Set<() => void>();

function setModality(next: InputModality) {
  if (next === modality) return;
  modality = next;
  listeners.forEach((listener) => listener());
}

function handleKeyDown() {
  setModality('keyboard');
}

function handlePointerDown() {
  setModality('pointer');
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

// Dipasang sekali saat modul dimuat, bukan saat ada pelanggan: PageEnter membaca nilainya tanpa berlangganan. Fase capture di window
// supaya nilainya sudah benar sebelum handler React memicu navigasi. Berkas test non-komponen berjalan tanpa window.
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('pointerdown', handlePointerDown, true);
}

export function getInputModality(): InputModality {
  return modality;
}

// Navigasi dari palette dianggap aksi keyboard walau item dipilih dengan klik.
export function markKeyboardInput() {
  setModality('keyboard');
}

export function useInputModality(): InputModality {
  return useSyncExternalStore(subscribe, getInputModality, () => 'pointer');
}

export function useIndicatorTransition() {
  return useInputModality() === 'keyboard' ? INSTANT_TRANSITION : INDICATOR_TRANSITION;
}
