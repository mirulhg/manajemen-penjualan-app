import type { HelpTopicSlug } from '../help-topics';
import type { HelpSection } from '../types';

export const ISTILAH_CONTENT = {
  istilah: [
    {
      heading: 'Istilah yang dipakai di aplikasi',
      blocks: [
        {
          type: 'table',
          columns: ['Istilah', 'Arti', 'Contoh'],
          rows: [
            { cells: ['**SKU**', 'Kode unik untuk setiap barang, dipakai untuk mencari barang dengan cepat.', 'SBK-001'] },
            { cells: ['**Satuan**', 'Cara barang dihitung.', 'sak, botol, bungkus'] },
            { cells: ['**Stok menipis**', 'Stok masih ada, tetapi sudah sampai batas menipis. Saatnya belanja lagi.', 'Beras batas 8, stok 8'] },
            { cells: ['**Stok habis**', 'Stok 0 atau kurang.', '—'] },
            { cells: ['**Diarsipkan**', 'Barang disembunyikan dan tidak bisa dijual, tetapi riwayatnya tetap tersimpan.', '—'] },
            { cells: ['**Retur**', 'Barang dikembalikan pembeli, dan uangnya dikembalikan.', '—'] },
            {
              ownerOnly: true,
              cells: ['**Omzet**', 'Total uang penjualan setelah dikurangi retur, tanpa transaksi batal.', 'Rp186.000 − retur Rp74.000 = Rp112.000'],
            },
            { ownerOnly: true, cells: ['**Penjualan kotor**', 'Total harga barang sebelum diskon dan retur.', '—'] },
            {
              ownerOnly: true,
              cells: ['**HPP** (harga pokok penjualan)', 'Harga beli dari barang yang terjual, memakai harga beli saat transaksi.', '1 sak beras: Rp68.000'],
            },
            {
              ownerOnly: true,
              cells: ['**Laba kotor**', 'Omzet − HPP. Belum dikurangi biaya lain seperti sewa atau listrik.', '74.000 − 68.000 = Rp6.000'],
            },
            { ownerOnly: true, cells: ['**Margin**', 'Laba kotor ÷ omzet, dalam persen.', '6.000 ÷ 74.000 = 8,1%'] },
            {
              ownerOnly: true,
              cells: ['**Nilai stok / nilai persediaan**', 'Stok × harga beli, yaitu modal yang tertahan di barang. Stok minus dihitung 0.', '22 sak × Rp68.000 = Rp1.496.000'],
            },
            { ownerOnly: true, cells: ['**Rata-rata transaksi**', 'Omzet ÷ jumlah transaksi, yaitu rata-rata belanja per pembeli.', '—'] },
            { ownerOnly: true, cells: ['**Stock opname**', 'Menghitung stok fisik lalu menyamakannya di aplikasi lewat "Koreksi".', '—'] },
            { ownerOnly: true, cells: ['**Restock**', 'Membeli ulang barang yang menipis.', '—'] },
          ],
        },
      ],
    },
  ],
  'masalah-umum': [
    {
      heading: 'Pertanyaan yang sering muncul',
      blocks: [
        {
          type: 'faq',
          items: [
            {
              question: 'Di mana data saya disimpan?',
              answer: [
                { type: 'paragraph', text: 'Di perangkat dan browser yang Anda pakai sekarang. Data tidak dikirim ke server, sehingga:' },
                {
                  type: 'list',
                  items: [
                    { text: 'Data di HP tidak muncul di laptop, dan sebaliknya.' },
                    {
                      text: '**Kalau data situs dihapus dari pengaturan browser, atau aplikasi dibuka di mode penyamaran (incognito), data tidak ada atau bisa hilang.** Jangan hapus data situs aplikasi ini.',
                    },
                  ],
                },
                { type: 'paragraph', text: 'Akun toko dan sinkronisasi antar perangkat sedang direncanakan.' },
              ],
            },
            {
              question: 'Muncul layar "Tidak ada koneksi internet".',
              answer: [
                {
                  type: 'paragraph',
                  text: 'Halaman itu belum pernah dibuka sejak aplikasi dimuat, jadi perlu internet untuk menampilkannya. Data Anda tetap aman. Halaman yang sudah pernah dibuka tetap bisa dipakai. Begitu internet kembali, layar berubah dan halaman bisa dimuat ulang.',
                },
              ],
            },
            {
              question: 'Muncul layar "Versi baru tersedia" atau "Koneksi sudah kembali".',
              answer: [
                {
                  type: 'paragraph',
                  text: 'Tekan "Muat ulang". Data tidak hilang. Satu-satunya yang hilang adalah isi keranjang Kasir yang belum disimpan.',
                },
              ],
            },
            {
              question: 'Muncul "Aplikasi gagal dimulai" atau "Data di perangkat ini tidak bisa dibuka".',
              answer: [
                {
                  type: 'paragraph',
                  text: 'Muat ulang halaman. Kalau masih gagal, pastikan Anda tidak sedang memakai mode penyamaran, dan browser tidak memblokir penyimpanan data untuk situs ini.',
                },
              ],
            },
            {
              question: 'Muncul "Halaman ini hanya untuk pemilik".',
              answer: [{ type: 'paragraph', text: 'Perangkat sedang di Mode Kasir. Pemilik perlu keluar dengan PIN untuk membuka halaman itu.' }],
            },
            {
              question: 'Lupa PIN.',
              answer: [
                {
                  type: 'paragraph',
                  text: 'Pakai kode pemulihan: di Pengaturan → "PIN pemilik" → "Lupa PIN?", atau di layar Keluar Mode Kasir → "Pakai kode pemulihan". Lihat topik Mode Kasir & PIN → "Lupa PIN".',
                },
              ],
            },
            {
              ownerOnly: true,
              question: 'Stok di aplikasi tidak sama dengan di rak.',
              answer: [
                {
                  type: 'paragraph',
                  text: 'Hitung stok fisiknya, lalu pakai "Sesuaikan stok" → "Koreksi". Di detail barang, Riwayat pergerakan menunjukkan kapan dan kenapa stok berubah.',
                },
              ],
            },
            {
              ownerOnly: true,
              question: 'Salah memasukkan transaksi.',
              answer: [
                {
                  type: 'paragraph',
                  text: 'Kalau hanya sebagian barang yang salah, pakai retur. Kalau seluruh transaksi salah, batalkan. Lihat topik Retur dan batal transaksi.',
                },
              ],
            },
            {
              ownerOnly: true,
              question: 'Saya mengubah harga beli, tetapi laba bulan lalu tidak berubah.',
              answer: [
                { type: 'paragraph', text: 'Itu disengaja. Laba dihitung dengan harga beli saat transaksi terjadi, supaya laporan lama tetap benar.' },
              ],
            },
          ],
        },
      ],
    },
  ],
} satisfies Partial<Record<HelpTopicSlug, readonly HelpSection[]>>;
