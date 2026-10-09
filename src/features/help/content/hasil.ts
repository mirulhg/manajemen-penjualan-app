import type { HelpTopicSlug } from '../help-topics';
import type { HelpSection } from '../types';

export const HASIL_CONTENT = {
  dasbor: [
    {
      heading: 'Untuk apa',
      blocks: [{ type: 'paragraph', text: 'Melihat kinerja toko secara sekilas, dibandingkan dengan periode sebelumnya.' }],
    },
    {
      heading: 'Langkah',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Buka **Dasbor**.' },
            { text: 'Pilih periode: "Hari ini", "7 hari", "30 hari", atau "Lainnya" ("Bulan ini", "12 bulan terakhir", "Rentang tanggal").' },
          ],
        },
      ],
    },
    {
      heading: 'Isi dasbor',
      blocks: [
        {
          type: 'list',
          items: [
            {
              text: '**Kartu ringkasan harian:** jumlah barang habis dan menipis, serta omzet kemarin. "Lihat daftar restock" membuka halaman Peringatan. "Tutup untuk hari ini" menyembunyikan kartu sampai besok.',
            },
            {
              text: '**Empat angka utama:**',
              children: [
                '**Omzet:** total penjualan setelah dikurangi retur, tanpa transaksi batal.',
                '**Transaksi:** jumlah transaksi yang tidak dibatalkan.',
                '**Rata-rata transaksi:** omzet ÷ jumlah transaksi.',
                '**Laba kotor:** omzet − HPP (harga beli barang yang terjual).',
              ],
            },
            {
              text: '**Baris kecil di bawah setiap angka** membandingkan dengan periode sebelumnya, misalnya "naik 12,5% · sebelumnya Rp1.200.000". Contoh pembanding: 7 hari terakhir dibanding 7 hari sebelumnya, dan "Bulan ini" dibanding tanggal yang sama bulan lalu.',
            },
            {
              text: '**Grafik:**',
              children: [
                '**Tren omzet:** periode ini dibanding periode sebelumnya.',
                '**Jam sibuk:** jumlah transaksi per jam. Berguna untuk mengatur jadwal jaga.',
                '**Omzet per kategori.**',
              ],
            },
            {
              text: '**Pintasan:** "Lihat transaksi", "Analisis produk", "Laporan", dan "Peringatan stok" (yang terakhir hanya bila lonceng peringatan nyala).',
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
            {
              text: 'Sebelum ada penjualan, Dasbor masih kosong dan menawarkan "Buka Kasir". Tombol "Muat data contoh" hanya bisa dipakai kalau belum ada barang sama sekali.',
            },
            { text: 'Setiap grafik bisa dilihat juga sebagai tabel angka lewat "Tampilkan tabel".' },
          ],
        },
      ],
    },
  ],
  'analisis-produk': [
    {
      heading: 'Untuk apa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Mengetahui barang mana yang paling laku, mana yang lambat laku, kapan stok akan habis, dan barang mana yang paling menguntungkan.',
        },
      ],
    },
    {
      heading: 'Isi halaman',
      blocks: [
        {
          type: 'list',
          items: [
            { text: '**Terlaris:** 10 barang dengan jumlah terjual terbanyak pada periode yang dipilih.' },
            {
              text: '**Lambat laku:** barang yang tidak terjual dalam 7/14/30/60/90 hari terakhir. Diurutkan dari nilai stok terbesar, yaitu barang yang paling banyak menahan modal.',
            },
            {
              text: '**Perkiraan stok habis:** dihitung dari penjualan 14 hari terakhir.',
              children: [
                'Contoh: beras terjual 28 sak dalam 14 hari, jadi rata-rata 2 sak per hari. Dengan stok 22, stok habis dalam **sekitar 11 hari**.',
                '"Saran restock" adalah jumlah yang perlu dibeli agar cukup untuk 14 hari ke depan dan stok berada di atas batas menipis.',
              ],
            },
            {
              text: '**Omzet & laba:** 10 barang teratas menurut omzet atau laba kotor, beserta marginnya.',
              children: [
                'Saat diurutkan menurut omzet, barang yang bersama-sama menyumbang 80% omzet diberi tanda "Penyumbang 80% omzet". Barang-barang inilah yang paling penting dijaga stoknya.',
              ],
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
            { text: 'Analisis baru muncul setelah penjualan pertama berumur minimal 7 hari (hari ini ikut dihitung).' },
            { text: 'Lambat laku dan perkiraan stok habis tidak mengikuti pilihan periode di atas halaman.' },
          ],
        },
      ],
    },
  ],
  laporan: [
    {
      heading: 'Untuk apa',
      blocks: [{ type: 'paragraph', text: 'Membuat laporan resmi untuk pembukuan atau untuk diserahkan ke pihak lain, lengkap dengan kop toko.' }],
    },
    {
      heading: 'Empat laporan',
      blocks: [
        {
          type: 'list',
          items: [
            { text: '**Penjualan:** jumlah transaksi, penjualan kotor, diskon, retur, omzet bersih, rincian per metode bayar, dan rincian per hari.' },
            { text: '**Laba kotor:** omzet, HPP, laba, dan margin, per kategori dan per produk.' },
            { text: '**Stok:** posisi stok dan nilai persediaan pada tanggal tertentu, termasuk tanggal di masa lalu.' },
            { text: '**Pergerakan stok:** untuk tiap barang, stok awal, masuk, terjual, retur/batal, koreksi, dan stok akhir.' },
          ],
        },
      ],
    },
    {
      heading: 'Langkah',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Buka **Laporan** dan pilih laporannya.' },
            { text: 'Pilih "Periode". Bawaannya "Bulan lalu". Untuk laporan Stok, pilih "Tanggal posisi stok".' },
            {
              text: 'Untuk mencetak atau menyimpan sebagai PDF, tekan "Cetak / Simpan PDF". Di jendela cetak, pilih printer, atau pilih "Simpan sebagai PDF".',
            },
            { text: 'Untuk mengolah angka di Excel, tekan "Unduh" lalu pilih "CSV" atau "Excel (.xlsx)".' },
          ],
        },
      ],
    },
    {
      heading: 'Contoh: laba kotor',
      blocks: [
        {
          type: 'paragraph',
          text: '1 sak beras dijual Rp74.000 dengan harga beli Rp68.000. Laba kotornya Rp6.000, dan marginnya 6.000 ÷ 74.000 = **8,1%**.',
        },
      ],
    },
    {
      heading: 'Perlu diketahui',
      blocks: [
        {
          type: 'list',
          items: [
            { text: 'Kop laporan diambil dari Profil toko. Kalau profil belum diisi, aplikasi mengingatkan Anda di layar.' },
            { text: '**HPP memakai harga beli saat transaksi terjadi.** Mengubah harga beli hari ini tidak mengubah laba bulan lalu.' },
            {
              text: 'Di laporan Penjualan dan Laba kotor, retur dihitung pada tanggal transaksi asal. Di laporan Pergerakan stok, retur dihitung pada tanggal barang kembali. Karena itu, angka "terjual" di kedua laporan bisa sedikit berbeda.',
            },
            { text: 'Laporan Pergerakan stok menyembunyikan barang yang tidak bergerak. Tekan "Tampilkan semua" untuk melihatnya.' },
            { text: 'Jalan pintas: Cari → "Unduh laporan penjualan bulan lalu".' },
          ],
        },
      ],
    },
  ],
} satisfies Partial<Record<HelpTopicSlug, readonly HelpSection[]>>;
