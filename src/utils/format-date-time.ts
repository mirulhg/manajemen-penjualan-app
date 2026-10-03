// timeZone opsional hanya agar test deterministik; di aplikasi memakai zona waktu perangkat.
export function formatDateTime(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(iso));
}

// Jam saja (HH:MM); id-ID memakai titik sebagai pemisah, diganti titik dua agar sesuai penulisan jam.
export function formatClock(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone })
    .format(new Date(iso))
    .replace('.', ':');
}
