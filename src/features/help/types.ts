// Penanda tampilan per item: ownerOnly disembunyikan di Mode Kasir, cashierOnly hanya tampil di Mode Kasir.
export type HelpFlags = { ownerOnly?: true; cashierOnly?: true };

export type HelpListItem = HelpFlags & { text: string; children?: readonly string[] };

export type HelpTableRow = HelpFlags & { cells: readonly string[] };

export type HelpBlock = HelpFlags &
  (
    | { type: 'paragraph'; text: string }
    | { type: 'steps'; items: readonly HelpListItem[] }
    | { type: 'list'; items: readonly HelpListItem[] }
    | { type: 'table'; columns: readonly string[]; rows: readonly HelpTableRow[] }
    | { type: 'faq'; items: readonly HelpFaqItem[] }
  );

export type HelpFaqItem = HelpFlags & { question: string; answer: readonly HelpBlock[] };

export type HelpSection = HelpFlags & { heading: string; blocks: readonly HelpBlock[] };

export type HelpGroup = 'memulai' | 'harian' | 'hasil' | 'mengatur' | 'istilah';

export type HelpTopicMeta = {
  slug: string;
  title: string;
  group: HelpGroup;
  summary: string;
  // Kata yang biasa dicari pemilik toko, dipakai pencarian ⌘K selain judulnya.
  keywords: string;
  audience: 'owner' | 'all';
  // Tujuan tombol "Buka halaman ini"; objek bila pemilik dan kasir dibawa ke halaman berbeda.
  openPage?: string | { owner: string; cashier: string };
};
