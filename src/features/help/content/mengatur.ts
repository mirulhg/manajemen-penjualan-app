import type { HelpTopicSlug } from '../help-topics';
import type { HelpSection } from '../types';

export const MENGATUR_CONTENT = {
  kategori: [
    {
      heading: 'Untuk apa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Mengelompokkan barang, misalnya Sembako atau Minuman, untuk penyaringan di Stok dan untuk laporan per kategori.',
        },
      ],
    },
    {
      heading: 'Langkah',
      blocks: [
        {
          type: 'list',
          items: [
            {
              text: '**Tambah:** isi "Kategori baru", lalu tekan "Tambah kategori". Kategori juga otomatis dibuat saat Anda mengetik kategori baru waktu menambah barang.',
            },
            { text: '**Ganti nama:** tekan "Ubah nama", ketik nama baru, lalu "Simpan". Semua barang di kategori itu ikut berganti kategori.' },
            { text: '**Hapus:** tekan "Hapus", lalu "Ya, hapus".' },
          ],
        },
      ],
    },
    {
      heading: 'Perlu diketahui',
      blocks: [
        {
          type: 'list',
          items: [
            {
              text: 'Kategori hanya bisa dihapus kalau tidak dipakai satu barang pun, termasuk barang arsip. Pindahkan dulu barangnya ke kategori lain lewat "Ubah barang".',
            },
            { text: 'Nama kategori tidak boleh kembar. Huruf besar/kecil dianggap sama.' },
          ],
        },
      ],
    },
  ],
  'mode-kasir': [
    {
      heading: 'Untuk apa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Supaya karyawan bisa memakai Kasir dan melihat stok tanpa bisa melihat harga beli, laba, laporan, atau mengubah pengaturan. Untuk keluar dari Mode Kasir dibutuhkan PIN pemilik.',
        },
      ],
    },
    {
      heading: 'Langkah: membuat PIN (sekali saja)',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Buka **Pengaturan** → "PIN pemilik".' },
            { text: 'Isi "PIN baru" (4–6 angka) dan "Isi ulang PIN", lalu tekan "Buat PIN".' },
            {
              text: 'Aplikasi menampilkan **kode pemulihan** berbentuk XXXX-XXXX. **Catat dan simpan di tempat aman**, karena kode ini hanya ditampilkan sekali. Lalu tekan "Sudah saya catat".',
            },
          ],
        },
      ],
    },
    {
      heading: 'Langkah: masuk Mode Kasir',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Di Pengaturan → "Mode Kasir", tekan "Masuk Mode Kasir".' },
            { text: 'Aplikasi pindah ke Kasir. Menu tinggal "Kasir", "Stok", dan "Keluar", dan di atas tertulis "Mode Kasir".' },
          ],
        },
      ],
    },
    {
      heading: 'Langkah: keluar Mode Kasir',
      blocks: [
        {
          type: 'steps',
          items: [{ text: 'Ketuk "Keluar".' }, { text: 'Isi "PIN pemilik", lalu tekan "Keluar Mode Kasir".' }],
        },
      ],
    },
    {
      heading: 'Lupa PIN',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Di layar Keluar Mode Kasir, ketuk "Pakai kode pemulihan".' },
            { text: 'Isi kode pemulihan dan PIN baru, lalu tekan "Pulihkan dan keluar".' },
            { text: 'Aplikasi memberi **kode pemulihan baru**. Catat kode ini, karena kode lama tidak berlaku lagi.' },
          ],
        },
        {
          type: 'paragraph',
          text: 'Kalau Anda lupa PIN saat **tidak** sedang di Mode Kasir: buka **Pengaturan** → "PIN pemilik", ketuk "Lupa PIN?", isi kode pemulihan dan PIN baru, lalu tekan "Simpan PIN baru". Catat kode pemulihan baru yang muncul.',
        },
      ],
    },
    {
      heading: 'Perlu diketahui',
      blocks: [
        {
          type: 'list',
          items: [
            { text: 'Setelah 5 kali salah PIN, aplikasi terkunci 1 menit. Pesannya: "Terlalu banyak percobaan. Coba lagi setelah pukul …".' },
            { text: 'Ganti PIN di Pengaturan → "PIN pemilik", dengan memasukkan PIN lama dan PIN baru.' },
            {
              text: 'Di Mode Kasir, transaksi tercatat atas nama "Kasir". Di luar Mode Kasir, tercatat atas nama "Pemilik". Pemilik bisa menyaring Riwayat berdasarkan nama ini.',
            },
            { text: 'Kalau kasir membuka halaman khusus pemilik, aplikasi menampilkan "Halaman ini hanya untuk pemilik".' },
            { text: 'Mode Kasir bukan akun terpisah. Aturan ini berlaku di perangkat ini saja.' },
          ],
        },
      ],
    },
  ],
  pengaturan: [
    {
      heading: 'Isi halaman',
      blocks: [
        {
          type: 'list',
          items: [
            {
              text: '**Penjualan → "Izinkan jual melebihi stok"** (bawaan: mati). Kalau dinyalakan, kasir tetap bisa menjual walaupun stok di aplikasi kurang, dan stok bisa menjadi minus. Berguna kalau barang sudah datang tetapi belum dicatat. Jangan lupa mencatat barang masuk sesudahnya.',
            },
            { text: '**Profil toko:** lihat topik Profil toko.' },
            {
              text: '**Peringatan stok:**',
              children: [
                '"Batas menipis default" (bawaan 5): batas untuk barang yang tidak punya batas sendiri.',
                '"Tampilkan lonceng peringatan" (bawaan: nyala).',
                '"Tampilkan ringkasan harian di Dasbor" (bawaan: nyala).',
                '"Tampilkan peringatan di Mode Kasir" (bawaan: mati). Kalau dinyalakan (bersama lonceng), kasir bisa melihat barang yang menipis, tetapi tidak melihat daftar restock.',
              ],
            },
            { text: '**PIN pemilik** dan **Mode Kasir:** lihat topik Mode Kasir & PIN.' },
            { text: '**Data contoh:** lihat topik Mencoba dengan data contoh.' },
            { text: '**"Kelola kategori":** membuka halaman Kategori.' },
            {
              text: '**"Apa yang baru":** daftar perubahan di setiap versi dan fitur yang akan datang. **Versi aplikasi** tertulis di paling bawah; sebutkan nomor ini saat melaporkan masalah.',
            },
          ],
        },
      ],
    },
  ],
  pembaruan: [
    {
      heading: 'Untuk apa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Mengetahui apa saja yang berubah setiap kali aplikasi diperbarui, dan fitur apa yang sedang disiapkan.',
        },
      ],
    },
    {
      heading: 'Langkah',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Buka **Pengaturan** → "Apa yang baru", atau tekan Cari (Ctrl K / ⌘K) lalu ketik "pembaruan".' },
            {
              text: 'Tab **"Apa yang baru"** berisi perubahan di setiap versi, dari yang terbaru. Versi yang sedang Anda pakai diberi tanda "Versi Anda".',
            },
            { text: 'Tab **"Segera hadir"** berisi fitur yang sedang disiapkan.' },
          ],
        },
      ],
    },
    {
      heading: 'Perlu diketahui',
      blocks: [
        {
          type: 'list',
          items: [
            {
              text: 'Setelah aplikasi diperbarui, muncul pemberitahuan "Diperbarui ke versi …" satu kali. Tekan "Lihat yang baru" untuk membuka halaman ini.',
            },
            {
              text: 'Di tab "Segera hadir", **Berikutnya** berarti akan dikerjakan dalam waktu dekat, **Direncanakan** sudah pasti tetapi belum dijadwalkan, dan **Dipertimbangkan** masih dinilai sehingga bisa berubah atau batal.',
            },
            { ownerOnly: true, text: 'Selama ada versi baru yang belum Anda lihat, tanda **"Baru"** muncul di Pengaturan.' },
          ],
        },
      ],
    },
  ],
} satisfies Partial<Record<HelpTopicSlug, readonly HelpSection[]>>;
