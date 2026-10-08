import { useSyncExternalStore } from 'react';

export type OnlineStatus = {
  isOnline: boolean;
  // Tetap true sejak offline pertama sampai halaman dimuat ulang: chunk yang gagal dimuat saat offline tidak dicoba lagi oleh router.
  wasOfflineSinceLoad: boolean;
};

const listeners = new Set<() => void>();
let status: OnlineStatus = {
  isOnline: typeof navigator === 'undefined' || navigator.onLine,
  wasOfflineSinceLoad: typeof navigator !== 'undefined' && !navigator.onLine,
};

function update(isOnline: boolean) {
  status = { isOnline, wasOfflineSinceLoad: status.wasOfflineSinceLoad || !isOnline };
  listeners.forEach((listener) => listener());
}

// Dipasang saat modul dimuat, bukan saat ada pelanggan: offline yang terjadi sebelum layar error tampil tidak boleh terlewat.
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => update(true));
  window.addEventListener('offline', () => update(false));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return status;
}

export function useOnlineStatus(): OnlineStatus {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
