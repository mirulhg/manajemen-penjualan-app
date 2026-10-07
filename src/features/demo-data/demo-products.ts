import type { NewProductFields } from '../stock';

// finalStock = stok yang diinginkan setelah seluruh simulasi; stok awal dihitung dari rencana transaksi (lihat load-demo-data).
// Beberapa barang sengaja di bawah atau tepat di batas minimum supaya peringatan stok terisi.
export type DemoProduct = Omit<NewProductFields, 'stockQuantity'> & { finalStock: number };

export const DEMO_PRODUCTS: DemoProduct[] = [
  { sku: 'SBK-001', name: 'Beras Premium 5 kg', category: 'Sembako', unit: 'sak', finalStock: 22, minStock: 8, purchasePrice: 68000, sellingPrice: 74000 },
  { sku: 'SBK-002', name: 'Minyak Goreng 2 L', category: 'Sembako', unit: 'pouch', finalStock: 4, minStock: 10, purchasePrice: 34000, sellingPrice: 38000 },
  { sku: 'SBK-003', name: 'Gula Pasir 1 kg', category: 'Sembako', unit: 'bungkus', finalStock: 30, minStock: 10, purchasePrice: 16500, sellingPrice: 18500 },
  { sku: 'SBK-004', name: 'Telur Ayam 1 kg', category: 'Sembako', unit: 'pack', finalStock: 0, minStock: 6, purchasePrice: 27000, sellingPrice: 30000 },
  { sku: 'MNM-001', name: 'Air Mineral 600 ml', category: 'Minuman', unit: 'botol', finalStock: 60, minStock: 24, purchasePrice: 2500, sellingPrice: 3500 },
  { sku: 'MNM-002', name: 'Teh Celup isi 25', category: 'Minuman', unit: 'kotak', finalStock: 5, minStock: 8, purchasePrice: 6500, sellingPrice: 8000 },
  { sku: 'MNM-003', name: 'Kopi Bubuk 165 g', category: 'Minuman', unit: 'bungkus', finalStock: 18, minStock: 8, purchasePrice: 12000, sellingPrice: 14500 },
  { sku: 'MNM-004', name: 'Susu Kental Manis 370 g', category: 'Minuman', unit: 'kaleng', finalStock: 14, minStock: 6, purchasePrice: 11500, sellingPrice: 13500 },
  { sku: 'MKR-001', name: 'Mi Instan Goreng', category: 'Makanan Ringan', unit: 'bungkus', finalStock: 80, minStock: 30, purchasePrice: 2800, sellingPrice: 3500 },
  { sku: 'MKR-002', name: 'Mi Instan Kuah Ayam', category: 'Makanan Ringan', unit: 'bungkus', finalStock: 12, minStock: 30, purchasePrice: 2700, sellingPrice: 3500 },
  { sku: 'MKR-003', name: 'Biskuit Kelapa 200 g', category: 'Makanan Ringan', unit: 'bungkus', finalStock: 25, minStock: 10, purchasePrice: 7500, sellingPrice: 9500 },
  { sku: 'MKR-004', name: 'Keripik Singkong 150 g', category: 'Makanan Ringan', unit: 'bungkus', finalStock: 3, minStock: 8, purchasePrice: 8000, sellingPrice: 10000 },
  { sku: 'BMB-001', name: 'Kecap Manis 520 ml', category: 'Bumbu Dapur', unit: 'botol', finalStock: 16, minStock: 6, purchasePrice: 19000, sellingPrice: 22000 },
  { sku: 'BMB-002', name: 'Saus Sambal 335 ml', category: 'Bumbu Dapur', unit: 'botol', finalStock: 20, minStock: 6, purchasePrice: 9500, sellingPrice: 12000 },
  { sku: 'BMB-003', name: 'Garam Dapur 250 g', category: 'Bumbu Dapur', unit: 'bungkus', finalStock: 35, minStock: 10, purchasePrice: 2500, sellingPrice: 3500 },
  { sku: 'BMB-004', name: 'Bumbu Racik Nasi Goreng', category: 'Bumbu Dapur', unit: 'sachet', finalStock: 40, minStock: 12, purchasePrice: 1800, sellingPrice: 2500 },
  { sku: 'PRM-001', name: 'Sabun Mandi Batang', category: 'Perlengkapan Mandi', unit: 'batang', finalStock: 28, minStock: 10, purchasePrice: 3000, sellingPrice: 4000 },
  { sku: 'PRM-002', name: 'Sampo Sachet', category: 'Perlengkapan Mandi', unit: 'sachet', finalStock: 2, minStock: 20, purchasePrice: 700, sellingPrice: 1000 },
  { sku: 'PRM-003', name: 'Pasta Gigi 120 g', category: 'Perlengkapan Mandi', unit: 'tube', finalStock: 15, minStock: 6, purchasePrice: 9000, sellingPrice: 11500 },
  { sku: 'PRM-004', name: 'Deterjen Bubuk 800 g', category: 'Perlengkapan Mandi', unit: 'bungkus', finalStock: 10, minStock: 5, purchasePrice: 15000, sellingPrice: 18000 },
];
