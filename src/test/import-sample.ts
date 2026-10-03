// Sama dengan contoh impor campur: 8 siap, 1 SKU sudah ada di seed (baris 10), 6 gagal (baris 11–16).
export const MIXED_IMPORT_CSV = "\uFEFF" + `SKU;Nama;Kategori;Satuan;Stok Awal;Batas Minimum;Harga Beli;Harga Jual
ATK-001;Pulpen Hitam;Alat Tulis;pcs;50;10;2.000;3.000
ATK-002;Buku Tulis 38 Lembar;Alat Tulis;pcs;40;10;3.500;5.000
ATK-003;Pensil 2B;Alat Tulis;pcs;30;;1.500;2.500
SBK-101;Kacang Hijau 500 g;sembako;bungkus;15;5;12.000;14.500
MNM-101;Sirup Jeruk 460 ml;Minuman;botol;8;;15.000;18.000
RMH-101;Sapu Ijuk;Kebutuhan Rumah;pcs;5;2;18000;25000
RMH-102;Kain Pel;Kebutuhan Rumah;PCS;0;;15.000;20.000
MKR-101;Kacang Atom 250 g;Makanan Ringan;bungkus;12;;9.000;11.000
sbk-001;Beras Premium 5 kg;Sembako;sak;10;5;68.000;74.000
ATK 004;Penghapus;Alat Tulis;pcs;20;;1.000;2.000
ATK-005;A;Alat Tulis;pcs;20;;1.000;2.000
ATK-006;Penggaris 30 cm;Alat Tulis;pcs;20;;2.000;12,5
ATK-007;Spidol Hitam;Alat Tulis;pcs;-3;;4.000;6.000
ATK-001;Pulpen Biru;Alat Tulis;pcs;25;;2.000;3.000
ATK-008;Lem Kertas;;pcs;10;;2.500;4.000
`;

export const SEED_PRODUCT_REFS = [{ sku: 'SBK-001', name: 'Beras Premium 5 kg' }];
