import type { HelpTopicSlug } from '../help-topics';
import type { HelpSection } from '../types';

export const HARIAN_CONTENT = {
  kasir: [
    {
      heading: 'Untuk apa',
      blocks: [{ type: 'paragraph', text: 'Mencatat setiap penjualan. Stok berkurang otomatis, dan transaksi masuk ke riwayat dan laporan.' }],
    },
    {
      heading: 'Langkah',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Buka **Kasir**.' },
            { text: 'Ketik nama atau SKU barang di "Cari barang", lalu ketuk barangnya. Setiap ketukan menambah 1 ke keranjang.' },
            {
              text: 'Atur jumlah dengan tombol − dan +, atau ketik angkanya langsung. Untuk mengeluarkan barang dari keranjang, ketuk ikon tempat sampah.',
            },
            {
              text: 'Kalau ada potongan harga:',
              children: ['Untuk satu barang, buka "Diskon" di baris barang itu.', 'Untuk seluruh belanja, buka "Diskon transaksi".'],
            },
            { text: 'Pilih "Metode bayar": **Tunai**, **Transfer**, atau **QRIS**.' },
            { text: 'Untuk Tunai, isi "Uang diterima", atau ketuk salah satu tombol saran seperti "Uang pas". Kembalian dihitung otomatis.' },
            { text: 'Tekan "Simpan transaksi".' },
          ],
        },
        {
          type: 'paragraph',
          text: 'Di HP dan tablet, metode bayar dan tombol simpan ada di panel tersendiri. Setelah ada barang di keranjang, muncul bar "N barang · Rp…" di bawah layar. Ketuk "Bayar" untuk membuka panel itu.',
        },
        {
          type: 'paragraph',
          text: 'Setelah tersimpan, muncul kotak hijau "Transaksi TRX-… tersimpan" berisi total dan kembalian. Tekan "Transaksi baru" untuk melayani pembeli berikutnya.',
        },
      ],
    },
    {
      heading: 'Contoh',
      blocks: [
        {
          type: 'paragraph',
          text: 'Pembeli mengambil 2 sak Beras Premium 5 kg (Rp74.000) dan 1 pouch Minyak Goreng 2 L (Rp38.000). Totalnya Rp186.000. Pembeli membayar tunai Rp200.000, jadi kembaliannya Rp14.000.',
        },
      ],
    },
    {
      heading: 'Perlu diketahui',
      blocks: [
        {
          type: 'list',
          items: [
            { text: 'Nomor transaksi berbentuk TRX-tanggal-urutan, misalnya TRX-20261008-0001. Urutannya mulai dari 1 lagi setiap hari.' },
            {
              text: 'Kalau stok tidak cukup, baris barang menampilkan "Stok tidak cukup (tersedia N)". Transaksi tidak bisa disimpan, kecuali pemilik menyalakan "Izinkan jual melebihi stok" di Pengaturan.',
            },
            {
              text: 'Untuk Transfer dan QRIS, aplikasi mencatat pembayaran pas sesuai total, tanpa kembalian. Aplikasi tidak memproses pembayarannya; Anda tetap menerima transfer atau scan QRIS seperti biasa.',
            },
            { text: '**Keranjang tidak disimpan.** Kalau Anda pindah halaman atau memuat ulang sebelum menekan "Simpan transaksi", isi keranjang hilang.' },
            { text: 'Harga yang dipakai adalah harga jual saat ini. Kalau harga berubah di tengah transaksi, aplikasi memberi tahu "Harga berubah dari … ke …".' },
            { text: 'Salah catat? Pemilik bisa meretur atau membatalkan transaksi dari Riwayat (lihat Retur dan batal transaksi).' },
          ],
        },
      ],
    },
  ],
  stok: [
    {
      heading: 'Untuk apa',
      blocks: [{ type: 'paragraph', text: 'Melihat semua barang, jumlah stoknya, dan barang mana yang menipis atau habis.' }],
    },
    {
      heading: 'Langkah',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Buka **Stok**.' },
            { text: 'Ketik nama atau SKU di kolom "Cari nama atau SKU".' },
            {
              text: 'Saring dengan "Kategori" atau "Status" ("Aman", "Menipis", "Habis"), lalu atur urutan lewat "Urutkan". Di HP, semua pilihan ini ada di tombol "Filter".',
            },
            {
              text: 'Ketuk sebuah barang untuk melihat detailnya, termasuk **Riwayat pergerakan**: catatan kapan stok bertambah atau berkurang, dan sebabnya.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Arti status',
      blocks: [
        {
          type: 'list',
          items: [
            { text: '**Habis:** stok 0 atau kurang.' },
            {
              text: '**Menipis:** stok masih ada, tetapi sudah sampai batas menipis barang itu. Kalau batas barang kosong, dipakai batas default toko, yaitu 5 kecuali diubah di Pengaturan.',
            },
            { text: '**Aman:** stok di atas batas.' },
          ],
        },
        { type: 'paragraph', text: 'Contoh: Beras Premium 5 kg dengan batas 8 berstatus Aman pada stok 9, Menipis pada stok 8, dan Habis pada stok 0.' },
      ],
    },
    {
      heading: 'Perlu diketahui',
      blocks: [
        {
          type: 'list',
          items: [
            { text: 'Barang yang diarsipkan disembunyikan dari daftar. Nyalakan "Tampilkan barang diarsipkan" untuk melihatnya.' },
            { text: 'Di atas daftar ada ringkasan "Jenis barang", "Total unit", dan "Nilai stok", yaitu stok × harga beli.', ownerOnly: true },
            { text: 'Di Mode Kasir, harga beli dan nilai stok tidak ditampilkan.', cashierOnly: true },
          ],
        },
      ],
    },
  ],
  'barang-masuk': [
    {
      heading: 'Untuk apa',
      blocks: [
        { type: 'paragraph', text: 'Menambah stok saat barang datang dari supplier, atau menyamakan stok dengan hasil hitung fisik (stock opname).' },
      ],
    },
    {
      heading: 'Langkah',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Buka **Stok**, ketuk barangnya, lalu tekan "Sesuaikan stok".',
              children: ['Jalan pintas: tekan Cari (Ctrl K / ⌘K), pilih "Barang masuk…", lalu ketik nama barangnya.'],
            },
            {
              text: 'Pilih "Jenis penyesuaian":',
              children: [
                '**Stok masuk:** barang datang dari supplier. Isi "Jumlah diterima", dan jumlah itu **ditambahkan** ke stok.',
                '**Koreksi:** stok disamakan dengan hasil hitung fisik. Isi "Jumlah hasil hitung", dan stok **diganti** dengan angka itu.',
              ],
            },
            { text: 'Isi "Alasan", misalnya "Kiriman supplier" atau "Hasil stock opname".' },
            { text: 'Periksa kalimat "Stok menjadi …", lalu tekan "Simpan penyesuaian".' },
          ],
        },
      ],
    },
    {
      heading: 'Contoh',
      blocks: [
        {
          type: 'list',
          items: [
            { text: 'Stok Beras Premium 22 sak, lalu datang 10 sak. Pilih Stok masuk dan isi 10, maka stok menjadi 32.' },
            {
              text: 'Hasil hitung di gudang ternyata 20 sak, padahal di aplikasi tercatat 22. Pilih Koreksi dan isi 20, maka stok menjadi 20 (−2).',
            },
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
            { text: 'Semua penyesuaian tercatat di Riwayat pergerakan barang, lengkap dengan alasannya.' },
            { text: 'Halaman ini **tidak mengubah harga beli**. Kalau harga dari supplier berubah, ubah lewat "Ubah barang" (lihat topik berikutnya).' },
            { text: 'Untuk barang yang rusak atau hilang, pakai **Koreksi** dengan jumlah yang tersisa, lalu tulis sebabnya di Alasan.' },
          ],
        },
      ],
    },
  ],
  'ubah-barang': [
    {
      heading: 'Untuk apa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Memperbarui nama, SKU, kategori, satuan, batas menipis, harga, atau foto barang. Barang yang tidak dijual lagi bisa diarsipkan dari halaman detail barang.',
        },
      ],
    },
    {
      heading: 'Langkah: mengubah barang',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Buka **Stok**, ketuk barangnya, lalu tekan "Ubah barang".' },
            { text: 'Ubah kolom yang perlu, lalu tekan "Simpan perubahan".' },
          ],
        },
      ],
    },
    {
      heading: 'Langkah: mengarsipkan barang',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Di detail barang, tekan "Arsipkan barang", lalu "Ya, arsipkan".' },
            {
              text: 'Untuk menjualnya lagi, buka barang itu (nyalakan "Tampilkan barang diarsipkan" di Stok), tekan "Pulihkan barang", lalu "Ya, pulihkan".',
            },
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
            { text: 'Setiap perubahan harga beli atau harga jual tercatat di "Riwayat harga" pada detail barang.' },
            {
              text: '**Harga baru hanya berlaku untuk penjualan berikutnya.** Transaksi lama tetap memakai harga saat transaksi itu terjadi, sehingga laporan masa lalu tidak berubah.',
            },
            {
              text: 'Barang tidak bisa dihapus, hanya diarsipkan. Barang arsip tidak muncul di Kasir, tetapi riwayat stok dan penjualannya tetap tersimpan.',
            },
            { text: 'Jumlah stok tidak diubah di sini. Pakai "Sesuaikan stok".' },
          ],
        },
      ],
    },
  ],
  riwayat: [
    {
      heading: 'Untuk apa',
      blocks: [{ type: 'paragraph', text: 'Melihat semua transaksi yang sudah tercatat, lalu membuka detailnya untuk retur atau pembatalan.' }],
    },
    {
      heading: 'Langkah',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Buka **Riwayat**.' },
            { text: 'Pilih "Periode": "Hari ini", "Kemarin", "7 hari terakhir", "30 hari terakhir", "Bulan ini", atau "Rentang tanggal".' },
            { text: 'Kalau perlu, saring dengan "Metode bayar" atau "Kasir" (Pemilik/Kasir). Di HP, pilihan ini ada di tombol "Filter".' },
            { text: 'Ketuk sebuah transaksi untuk membuka **Detail Transaksi**.' },
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
              text: 'Di atas daftar tertulis jumlah transaksi dan omzet periode itu. Transaksi yang dibatalkan tidak ikut dihitung, dan retur sudah dikurangkan.',
            },
            { text: 'Label status transaksi:', children: ['"Selesai"', '"Retur sebagian"', '"Diretur penuh"', '"Dibatalkan"'] },
          ],
        },
      ],
    },
  ],
  'retur-batal': [
    {
      heading: 'Untuk apa',
      blocks: [
        {
          type: 'list',
          items: [
            { text: '**Retur:** pembeli mengembalikan sebagian atau semua barang, dan uangnya dikembalikan.' },
            { text: '**Batal:** transaksi salah catat atau tidak jadi. Seluruh transaksi dibatalkan.' },
          ],
        },
      ],
    },
    {
      heading: 'Langkah: retur',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Buka **Riwayat**, lalu ketuk transaksinya.' },
            { text: 'Tekan "Retur barang".' },
            { text: 'Isi jumlah yang dikembalikan pada barang yang diretur. Biarkan kosong untuk barang yang tidak diretur.' },
            { text: 'Isi "Alasan retur". Aplikasi menampilkan "Uang dikembalikan Rp …".' },
            { text: 'Tekan "Simpan retur".' },
          ],
        },
      ],
    },
    {
      heading: 'Langkah: batal',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Buka transaksinya, lalu tekan "Batalkan transaksi".' },
            { text: 'Isi "Alasan pembatalan", lalu tekan "Ya, batalkan".' },
          ],
        },
      ],
    },
    {
      heading: 'Contoh',
      blocks: [
        {
          type: 'paragraph',
          text: 'Dari transaksi 2 sak beras + 1 minyak (Rp186.000), pembeli mengembalikan 1 sak beras. Uang yang dikembalikan Rp74.000. Stok beras bertambah 1, dan omzet transaksi itu menjadi Rp112.000.',
        },
      ],
    },
    {
      heading: 'Perlu diketahui',
      blocks: [
        {
          type: 'list',
          items: [
            { text: 'Retur bisa dilakukan beberapa kali sampai semua barang habis diretur, tetapi jumlahnya tidak bisa melebihi jumlah yang dibeli.' },
            { text: 'Kalau transaksi memakai diskon, uang retur dihitung dari harga setelah diskon.' },
            { text: 'Retur dan pembatalan **mengurangi omzet pada tanggal transaksi aslinya**, bukan pada tanggal retur.' },
            {
              text: 'Pembatalan mengembalikan stok yang belum diretur. Transaksinya **tidak dihapus**: tetap ada di Riwayat dengan label "Dibatalkan" beserta alasannya, tetapi tidak dihitung di omzet. **Pembatalan tidak bisa diurungkan.**',
            },
            { text: 'Retur dan pembatalan hanya bisa dilakukan pemilik. Kasir di Mode Kasir tidak bisa membuka Riwayat.' },
          ],
        },
      ],
    },
  ],
  peringatan: [
    {
      heading: 'Untuk apa',
      blocks: [{ type: 'paragraph', text: 'Memberi tahu barang mana yang menipis atau habis, dan membantu menyusun daftar belanja ke supplier.' }],
    },
    {
      heading: 'Langkah',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Ketuk **ikon lonceng** di kanan atas. Angka di lonceng menunjukkan peringatan yang belum dilihat. Pemilik juga bisa membukanya dari tombol "Lihat daftar restock" di Dasbor.',
            },
            {
              text: 'Halaman "Peringatan stok" menampilkan barang yang "Habis" lebih dulu, lalu yang "Menipis". Begitu halaman dibuka, semua peringatan dianggap sudah dilihat.',
            },
            {
              text: 'Di bagian "Daftar perlu restock", tekan "Bagikan daftar" untuk mengirim daftar belanja lewat WhatsApp, atau salin dan tempel ke catatan.',
              ownerOnly: true,
            },
          ],
        },
      ],
    },
    {
      heading: 'Contoh',
      blocks: [
        {
          type: 'paragraph',
          text: 'Daftar perlu restock menyarankan jumlah beli yang cukup untuk 14 hari ke depan (dihitung dari penjualan 14 hari terakhir), dan sekaligus mengangkat stok di atas batas menipis. Misalnya beras terjual 28 sak dalam 14 hari dan stoknya tinggal 7. Saran beli: 28 − 7 = **21 sak**. Untuk barang yang jarang laku, saran itu minimal cukup untuk melewati batas menipis.',
        },
      ],
    },
    {
      heading: 'Perlu diketahui',
      blocks: [
        {
          type: 'list',
          items: [
            { text: 'Peringatan hilang sendiri setelah stok kembali aman, misalnya setelah barang masuk dicatat.' },
            { text: 'Barang yang diarsipkan tidak mendapat peringatan.' },
            { text: 'Daftar yang dibagikan tidak memuat harga beli.' },
            {
              text: 'Pemilik bisa mengatur lonceng, kartu ringkasan harian, dan izin kasir di Pengaturan → "Peringatan stok". Supaya kasir bisa membuka halaman ini, "Tampilkan lonceng peringatan" dan "Tampilkan peringatan di Mode Kasir" harus sama-sama nyala.',
            },
          ],
        },
      ],
    },
  ],
} satisfies Partial<Record<HelpTopicSlug, readonly HelpSection[]>>;
