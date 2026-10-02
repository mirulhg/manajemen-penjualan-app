import type { Product } from './schema';

type SeedProduct = Pick<
  Product,
  'sku' | 'name' | 'category' | 'unit' | 'stockQuantity' | 'minStock' | 'purchasePrice' | 'sellingPrice'
>;

const SEMBAKO = 'Sembako';
const MINUMAN = 'Minuman';
const MAKANAN_RINGAN = 'Makanan Ringan';
const BUMBU_DAPUR = 'Bumbu Dapur';
const PERLENGKAPAN_MANDI = 'Perlengkapan Mandi';
const KEBUTUHAN_RUMAH = 'Kebutuhan Rumah';

// Sumber: Docs/Data Contoh Produk.md. minStock null = memakai batas default global.
export const SEED_PRODUCTS: SeedProduct[] = [
  { sku: 'SBK-001', name: 'Beras Premium 5 kg', category: SEMBAKO, unit: 'sak', stockQuantity: 18, minStock: 5, purchasePrice: 68000, sellingPrice: 74000 },
  { sku: 'SBK-002', name: 'Minyak Goreng 2 L', category: SEMBAKO, unit: 'pouch', stockQuantity: 3, minStock: 10, purchasePrice: 34000, sellingPrice: 38000 },
  { sku: 'SBK-003', name: 'Gula Pasir 1 kg', category: SEMBAKO, unit: 'bungkus', stockQuantity: 25, minStock: 10, purchasePrice: 16500, sellingPrice: 18500 },
  { sku: 'SBK-004', name: 'Tepung Terigu 1 kg', category: SEMBAKO, unit: 'bungkus', stockQuantity: 12, minStock: null, purchasePrice: 11000, sellingPrice: 13000 },
  { sku: 'SBK-005', name: 'Telur Ayam 1 kg', category: SEMBAKO, unit: 'pack', stockQuantity: 0, minStock: 5, purchasePrice: 27000, sellingPrice: 30000 },
  { sku: 'SBK-006', name: 'Garam Dapur 250 g', category: SEMBAKO, unit: 'bungkus', stockQuantity: 40, minStock: null, purchasePrice: 2500, sellingPrice: 3500 },
  { sku: 'MNM-001', name: 'Air Mineral 600 ml', category: MINUMAN, unit: 'botol', stockQuantity: 48, minStock: 24, purchasePrice: 2500, sellingPrice: 3500 },
  { sku: 'MNM-002', name: 'Air Mineral Galon 19 L', category: MINUMAN, unit: 'galon', stockQuantity: 6, minStock: 5, purchasePrice: 18000, sellingPrice: 21000 },
  { sku: 'MNM-003', name: 'Teh Celup isi 25', category: MINUMAN, unit: 'kotak', stockQuantity: 4, minStock: null, purchasePrice: 6500, sellingPrice: 8000 },
  { sku: 'MNM-004', name: 'Kopi Bubuk 165 g', category: MINUMAN, unit: 'bungkus', stockQuantity: 15, minStock: null, purchasePrice: 12000, sellingPrice: 14500 },
  { sku: 'MNM-005', name: 'Susu Kental Manis 370 g', category: MINUMAN, unit: 'kaleng', stockQuantity: 5, minStock: 6, purchasePrice: 11500, sellingPrice: 13500 },
  { sku: 'MNM-006', name: 'Teh Siap Minum 350 ml', category: MINUMAN, unit: 'botol', stockQuantity: 0, minStock: 12, purchasePrice: 3800, sellingPrice: 5000 },
  { sku: 'MKR-001', name: 'Mi Instan Goreng', category: MAKANAN_RINGAN, unit: 'bungkus', stockQuantity: 60, minStock: 20, purchasePrice: 2800, sellingPrice: 3500 },
  { sku: 'MKR-002', name: 'Mi Instan Kuah Ayam', category: MAKANAN_RINGAN, unit: 'bungkus', stockQuantity: 18, minStock: 20, purchasePrice: 2700, sellingPrice: 3500 },
  { sku: 'MKR-003', name: 'Biskuit Kelapa 200 g', category: MAKANAN_RINGAN, unit: 'bungkus', stockQuantity: 9, minStock: null, purchasePrice: 7500, sellingPrice: 9500 },
  { sku: 'MKR-004', name: 'Keripik Singkong 150 g', category: MAKANAN_RINGAN, unit: 'bungkus', stockQuantity: 2, minStock: null, purchasePrice: 8000, sellingPrice: 10000 },
  { sku: 'MKR-005', name: 'Roti Tawar', category: MAKANAN_RINGAN, unit: 'bungkus', stockQuantity: 0, minStock: 3, purchasePrice: 13000, sellingPrice: 16000 },
  { sku: 'BMB-001', name: 'Kecap Manis 520 ml', category: BUMBU_DAPUR, unit: 'botol', stockQuantity: 11, minStock: null, purchasePrice: 19000, sellingPrice: 22000 },
  { sku: 'BMB-002', name: 'Saus Sambal 335 ml', category: BUMBU_DAPUR, unit: 'botol', stockQuantity: 7, minStock: null, purchasePrice: 9500, sellingPrice: 12000 },
  { sku: 'BMB-003', name: 'Penyedap Rasa 100 g', category: BUMBU_DAPUR, unit: 'bungkus', stockQuantity: 1, minStock: null, purchasePrice: 5500, sellingPrice: 7000 },
  { sku: 'BMB-004', name: 'Bawang Merah 250 g', category: BUMBU_DAPUR, unit: 'pack', stockQuantity: 8, minStock: 4, purchasePrice: 9000, sellingPrice: 11500 },
  { sku: 'BMB-005', name: 'Merica Bubuk 50 g', category: BUMBU_DAPUR, unit: 'bungkus', stockQuantity: 20, minStock: null, purchasePrice: 4000, sellingPrice: 5500 },
  { sku: 'MND-001', name: 'Sabun Mandi Batang 85 g', category: PERLENGKAPAN_MANDI, unit: 'pcs', stockQuantity: 30, minStock: 10, purchasePrice: 3200, sellingPrice: 4500 },
  { sku: 'MND-002', name: 'Sampo Sachet 10 ml isi 12', category: PERLENGKAPAN_MANDI, unit: 'renteng', stockQuantity: 8, minStock: null, purchasePrice: 9000, sellingPrice: 11000 },
  { sku: 'MND-003', name: 'Pasta Gigi 190 g', category: PERLENGKAPAN_MANDI, unit: 'tube', stockQuantity: 0, minStock: null, purchasePrice: 11000, sellingPrice: 13500 },
  { sku: 'MND-004', name: 'Sikat Gigi', category: PERLENGKAPAN_MANDI, unit: 'pcs', stockQuantity: 14, minStock: null, purchasePrice: 4500, sellingPrice: 6500 },
  { sku: 'RMH-001', name: 'Deterjen Bubuk 800 g', category: KEBUTUHAN_RUMAH, unit: 'bungkus', stockQuantity: 10, minStock: 6, purchasePrice: 17000, sellingPrice: 20000 },
  { sku: 'RMH-002', name: 'Sabun Cuci Piring 780 ml', category: KEBUTUHAN_RUMAH, unit: 'pouch', stockQuantity: 6, minStock: 6, purchasePrice: 13000, sellingPrice: 15500 },
  { sku: 'RMH-003', name: 'Tisu Wajah 250 lembar', category: KEBUTUHAN_RUMAH, unit: 'pack', stockQuantity: 22, minStock: null, purchasePrice: 12500, sellingPrice: 15000 },
  { sku: 'RMH-004', name: 'Gas LPG 3 kg', category: KEBUTUHAN_RUMAH, unit: 'tabung', stockQuantity: 4, minStock: 5, purchasePrice: 19000, sellingPrice: 22000 },
];
