import { ArrowLeftRight, Bell, ChartColumn, FileText, History, LayoutDashboard, LogOut, Package, Receipt, Settings, ShoppingCart, Tags, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type PalettePage = {
  to: string;
  label: string;
  icon: LucideIcon;
  // Kata lain yang dicari orang untuk halaman ini, selain labelnya.
  keywords: string;
};

type PaletteAccess = { isCashierMode: boolean; canCashierSeeAlerts: boolean };

const OWNER_PAGES: PalettePage[] = [
  { to: '/dasbor', label: 'Dasbor', icon: LayoutDashboard, keywords: 'ringkasan omzet' },
  { to: '/stok', label: 'Stok', icon: Package, keywords: 'barang produk' },
  { to: '/kasir', label: 'Kasir', icon: ShoppingCart, keywords: 'jual bayar' },
  { to: '/penjualan', label: 'Riwayat', icon: History, keywords: 'transaksi penjualan' },
  { to: '/laporan', label: 'Laporan', icon: FileText, keywords: '' },
  { to: '/laporan/penjualan', label: 'Laporan Penjualan', icon: Receipt, keywords: 'laporan omzet' },
  { to: '/laporan/laba-kotor', label: 'Laporan Laba kotor', icon: TrendingUp, keywords: 'laporan untung hpp' },
  { to: '/laporan/stok', label: 'Laporan Stok', icon: Package, keywords: 'laporan persediaan' },
  { to: '/laporan/pergerakan-stok', label: 'Laporan Pergerakan stok', icon: ArrowLeftRight, keywords: 'laporan masuk keluar' },
  { to: '/dasbor/produk', label: 'Analisis produk', icon: ChartColumn, keywords: 'terlaris lambat laku' },
  { to: '/peringatan', label: 'Peringatan', icon: Bell, keywords: 'stok menipis habis restock' },
  { to: '/kategori', label: 'Kategori', icon: Tags, keywords: 'kelompok barang' },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings, keywords: 'pin toko profil' },
];

const CASHIER_PAGES: PalettePage[] = [
  { to: '/kasir', label: 'Kasir', icon: ShoppingCart, keywords: 'jual bayar' },
  { to: '/stok', label: 'Stok', icon: Package, keywords: 'barang produk' },
  { to: '/peringatan', label: 'Peringatan', icon: Bell, keywords: 'stok menipis habis restock' },
  { to: '/keluar-mode-kasir', label: 'Keluar Mode Kasir', icon: LogOut, keywords: 'pin pemilik' },
];

// Sama dengan aturan akses di AppLayout: Mode Kasir hanya melihat halaman kasir, dan Peringatan hanya bila pemilik mengizinkan.
export function getVisiblePages({ isCashierMode, canCashierSeeAlerts }: PaletteAccess): PalettePage[] {
  if (!isCashierMode) return OWNER_PAGES;
  return CASHIER_PAGES.filter((page) => page.to !== '/peringatan' || canCashierSeeAlerts);
}

export function matchesQuery(query: string, ...texts: string[]): boolean {
  const needle = query.trim().toLowerCase();
  return needle === '' || texts.some((text) => text.toLowerCase().includes(needle));
}
