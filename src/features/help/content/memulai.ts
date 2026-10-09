import type { HelpTopicSlug } from '../help-topics';
import type { HelpSection } from '../types';

export const MEMULAI_CONTENT = {
  mulai: [
    {
      heading: 'Untuk apa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Aplikasi ini mencatat stok barang dan penjualan toko Anda, lalu merangkumnya menjadi dasbor dan laporan. Semua data tersimpan di perangkat ini, jadi aplikasi bisa dipakai tanpa akun.',
        },
      ],
    },
    {
      heading: 'Langkah pertama yang disarankan',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: '**Isi profil toko** di Pengaturan, yaitu nama, alamat, telepon, dan logo. Data ini muncul di kepala setiap laporan.' },
            { text: '**Masukkan barang.** Tambahkan satu per satu lewat "Tambah barang", atau sekaligus lewat "Impor" dari file Excel/CSV.' },
            { text: '**Buat PIN pemilik** di Pengaturan, lalu simpan kode pemulihannya. PIN ini dibutuhkan kalau kasir lain ikut memakai perangkat ini.' },
            { text: '**Catat penjualan pertama** di Kasir.' },
            { text: 'Setelah ada penjualan, buka **Dasbor** untuk melihat omzet dan laba.' },
          ],
        },
        { type: 'paragraph', text: 'Ingin mencoba dulu tanpa memasukkan data sendiri? Lihat topik Mencoba dengan data contoh.' },
      ],
    },
    {
      heading: 'Menu utama',
      blocks: [
        {
          type: 'list',
          items: [
            { text: '**Dasbor:** ringkasan omzet, transaksi, dan laba.' },
            { text: '**Stok:** daftar barang dan jumlah stoknya.' },
            { text: '**Kasir:** mencatat penjualan.' },
            { text: '**Riwayat:** daftar transaksi yang sudah tercatat.' },
            { text: '**Pengaturan:** profil toko, PIN, Mode Kasir, dan aturan stok.' },
          ],
        },
        {
          type: 'paragraph',
          text: 'Di layar komputer, tombol "Cari…" (atau tekan Ctrl K / ⌘K) bisa membuka halaman mana pun, mencari barang, atau menjalankan aksi cepat seperti "Barang masuk…". Di HP, ketuk ikon kaca pembesar di kanan atas.',
        },
      ],
    },
  ],
  'profil-toko': [
    {
      heading: 'Untuk apa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Nama, alamat, telepon, dan logo toko dipakai di kepala (kop) laporan. Nama toko juga tampil di bagian atas aplikasi dan di judul daftar belanja yang Anda bagikan.',
        },
      ],
    },
    {
      heading: 'Langkah',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Buka **Pengaturan**, lalu cari bagian "Profil toko".' },
            { text: 'Isi "Nama toko" (wajib), lalu "Alamat (opsional)" dan "Telepon (opsional)".' },
            { text: 'Untuk logo, tekan "Pilih logo" dan pilih gambar dari perangkat. Gambar otomatis diperkecil.' },
            { text: 'Tekan "Simpan profil".' },
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
            { text: 'Selama profil belum diisi, aplikasi menulis nama toko sebagai "Toko Saya".' },
            { text: 'Logo berupa file gambar (misalnya JPG, PNG, atau WebP), maksimal 10 MB.' },
            { text: 'Untuk menghapus logo, tekan "Hapus logo", lalu tekan "Simpan profil".' },
          ],
        },
      ],
    },
  ],
  'tambah-barang': [
    {
      heading: 'Untuk apa',
      blocks: [{ type: 'paragraph', text: 'Mendaftarkan barang yang dijual di toko, lengkap dengan harga dan stok awalnya.' }],
    },
    {
      heading: 'Langkah',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Buka **Stok**, lalu tekan "Tambah barang".' },
            {
              text: 'Isi kolom-kolomnya:',
              children: [
                '**Nama barang**, misalnya "Beras Premium 5 kg".',
                '**SKU**: kode unik barang, misalnya "SBK-001". Boleh berisi huruf, angka, dan tanda hubung, sepanjang 2–32 karakter. Huruf kecil otomatis diubah menjadi huruf besar.',
                '**Kategori**: ketik nama kategori. Kalau kategorinya belum ada, aplikasi otomatis membuatnya.',
                '**Satuan**, misalnya sak, botol, bungkus, atau pcs.',
                '**Stok awal**: jumlah barang yang ada sekarang. Boleh 0.',
                '**Batas stok menipis (opsional)**: kalau stok turun sampai angka ini, barang ditandai "Menipis". Biarkan kosong untuk memakai batas default toko.',
                '**Harga beli (Rp)** dan **Harga jual (Rp)**: boleh ditulis 74000 atau 74.000.',
                '**Foto barang (opsional).**',
              ],
            },
            { text: 'Tekan "Simpan barang".' },
          ],
        },
        { type: 'paragraph', text: 'Setelah barang tersimpan, formulir langsung kosong kembali sehingga Anda bisa memasukkan barang berikutnya.' },
      ],
    },
    {
      heading: 'Contoh',
      blocks: [
        {
          type: 'paragraph',
          text: 'Beras Premium 5 kg, SKU SBK-001, kategori Sembako, satuan sak, stok awal 22, batas menipis 8, harga beli Rp68.000, harga jual Rp74.000.',
        },
      ],
    },
    {
      heading: 'Perlu diketahui',
      blocks: [
        {
          type: 'list',
          items: [
            { text: 'SKU tidak boleh sama dengan barang lain, termasuk barang yang sudah diarsipkan.' },
            { text: 'Kalau harga jual lebih rendah dari harga beli, aplikasi memberi peringatan "Barang ini akan dijual rugi". Barang tetap bisa disimpan.' },
            {
              text: 'Setelah barang tersimpan, jumlah stok tidak bisa diketik ulang di halaman "Ubah barang". Untuk mengubah stok, pakai "Sesuaikan stok" (lihat topik Barang masuk & koreksi stok).',
            },
            { text: 'Banyak barang sekaligus? Lebih cepat lewat Impor barang dari Excel.' },
          ],
        },
      ],
    },
  ],
  'impor-barang': [
    {
      heading: 'Untuk apa',
      blocks: [{ type: 'paragraph', text: 'Memasukkan banyak barang sekaligus dari file Excel (.xlsx) atau CSV.' }],
    },
    {
      heading: 'Langkah',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Buka **Stok**, lalu tekan "Impor".' },
            {
              text: 'Tekan "Unduh template CSV". Isi file itu, satu baris per barang, dengan kolom:',
              children: ['"SKU"', '"Nama"', '"Kategori"', '"Satuan"', '"Stok Awal"', '"Batas Minimum" (boleh kosong)', '"Harga Beli"', '"Harga Jual"'],
            },
            { text: 'Kembali ke halaman Impor, lalu pilih file Anda di "File barang".' },
            { text: 'Periksa pratinjau. Aplikasi menampilkan berapa baris yang **Siap diimpor**, **Dilewati**, dan **Gagal**, beserta alasannya.' },
            { text: 'Tekan "Impor N barang".' },
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
            { text: 'Urutan kolom bebas, dan huruf besar/kecil pada nama kolom tidak berpengaruh.' },
            { text: 'Baris yang SKU-nya sudah ada di toko akan **dilewati**. Data barang lama tidak diubah.' },
            {
              text: 'Baris yang isinya salah (misalnya harga bukan angka) akan **gagal**, dan alasannya terlihat di tabel pratinjau. Setelah impor, Anda bisa menekan "Unduh laporan baris gagal" untuk memperbaikinya di Excel.',
            },
            { text: 'Batasnya 5 MB dan 2.000 baris per file. Kalau lebih, pecah filenya menjadi beberapa bagian.' },
            { text: 'Impor berjalan semua-atau-tidak-sama-sekali. Kalau penyimpanan gagal, tidak ada barang yang tersimpan setengah jalan.' },
          ],
        },
      ],
    },
  ],
  'data-contoh': [
    {
      heading: 'Untuk apa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Mengisi aplikasi dengan 20 barang dan 60 hari transaksi contoh, termasuk retur dan pembatalan. Dengan begitu, Anda bisa mencoba semua fitur sebelum memasukkan data sendiri.',
        },
      ],
    },
    {
      heading: 'Langkah',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Tekan "Muat data contoh" di Dasbor atau di Pengaturan.' },
            { text: 'Coba semua menu. Selama data contoh aktif, muncul pita "Data contoh" di atas halaman (kecuali di Kasir).' },
            { text: 'Setelah selesai mencoba, ketuk "Hapus data contoh" di pita itu, lalu tekan "Ya, hapus semua".' },
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
            { text: 'Data contoh hanya bisa dimuat kalau aplikasi **belum berisi barang maupun transaksi**.' },
            { text: 'Kalau PIN belum dibuat, data contoh memasang PIN Mode Kasir **1234**.' },
            {
              text: '"Hapus data contoh" menghapus **semua** barang, kategori, dan transaksi, **termasuk yang Anda tambahkan sendiri** setelah data contoh dimuat. Tindakan ini tidak bisa dibatalkan.',
            },
            {
              text: 'Profil toko dan pengaturan tidak ikut terhapus. PIN contoh 1234 ikut terhapus kalau belum Anda ganti, jadi buat PIN baru sebelum memakai Mode Kasir.',
            },
          ],
        },
      ],
    },
  ],
} satisfies Partial<Record<HelpTopicSlug, readonly HelpSection[]>>;
