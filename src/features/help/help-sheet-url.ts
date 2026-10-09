const HELP_PARAM = 'bantuan';

export function readHelpSlug(search: string): string | null {
  return new URLSearchParams(search).get(HELP_PARAM);
}

export function withoutHelpParam(search: string): string {
  const params = new URLSearchParams(search);
  params.delete(HELP_PARAM);
  const text = params.toString();
  return text === '' ? '' : `?${text}`;
}

// Parameter lain (misalnya filter Riwayat) dipertahankan.
export function withHelpParam(search: string, slug: string): string {
  const params = new URLSearchParams(search);
  params.set(HELP_PARAM, slug);
  return `?${params.toString()}`;
}

export function hasOpenedInApp(state: unknown): boolean {
  return typeof state === 'object' && state !== null && 'helpOpenedInApp' in state && state.helpOpenedInApp === true;
}

// State halaman (mis. filter daftar stok untuk tombol kembali) digabung, bukan ditimpa.
export function withOpenedInAppFlag(state: unknown): object {
  return { ...(typeof state === 'object' && state !== null ? state : {}), helpOpenedInApp: true };
}
