import type { RoadmapItem } from './types';

// Urutan di sini = urutan tampil dalam kelompoknya. Item yang selesai dihapus dan pindah ke changelog-entries.ts.
export const ROADMAP_ITEMS: readonly RoadmapItem[] = [
  {
    status: 'next',
    title: 'Pasang di HP & tetap jalan tanpa internet',
    description: 'Aplikasi bisa dipasang di layar utama HP seperti aplikasi biasa, dan tetap terbuka walau sinyal hilang.',
  },
  {
    status: 'next',
    title: 'Cadangkan & pulihkan data',
    description: 'Simpan seluruh data toko ke satu file, lalu pulihkan di HP atau laptop lain kalau perangkat rusak atau hilang.',
    ownerOnly: true,
  },
  {
    status: 'planned',
    title: 'Akun toko & sinkronisasi antar-HP',
    description: 'Masuk dengan akun, sehingga data toko sama di semua HP dan laptop. Setiap kasir punya akun sendiri.',
  },
  {
    status: 'considering',
    title: 'Scan barcode',
    description: 'Isi SKU dan cari barang di Kasir dengan kamera HP.',
  },
  {
    status: 'considering',
    title: 'Struk digital',
    description: 'Kirim struk lewat WhatsApp atau cetak ke printer thermal Bluetooth.',
  },
  {
    status: 'considering',
    title: 'Varian produk',
    description: 'Satu barang dengan beberapa ukuran atau warna, dengan stok terpisah untuk setiap varian.',
    ownerOnly: true,
  },
  {
    status: 'considering',
    title: 'Laporan terjadwal ke email',
    description: 'Laporan mingguan atau bulanan terkirim otomatis ke email. Membutuhkan akun toko.',
    ownerOnly: true,
  },
];
