export const DEFAULT_PAGE_SIZE = 50;

// Parameter ?halaman= yang bukan bilangan bulat positif dianggap halaman 1.
export function parsePageParam(raw: string | null): number {
  return raw !== null && /^[1-9]\d*$/.test(raw) ? Number(raw) : 1;
}

// Halaman di luar jangkauan (mis. data berkurang atau URL diketik manual) kembali ke halaman 1.
export function clampPage(page: number, pageCount: number): number {
  return page <= pageCount ? page : 1;
}
