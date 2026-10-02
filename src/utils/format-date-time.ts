// timeZone opsional hanya agar test deterministik; di aplikasi memakai zona waktu perangkat.
export function formatDateTime(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(iso));
}
