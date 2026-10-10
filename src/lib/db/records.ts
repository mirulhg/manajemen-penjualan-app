import { z } from 'zod';

export const productSchema = z.object({
  id: z.uuid(),
  sku: z
    .string()
    .min(1)
    .refine((sku) => sku === sku.toUpperCase(), 'SKU harus huruf besar'),
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1),
  // Boleh negatif: terjadi bila pemilik mengizinkan jual melebihi stok. Aturan bisnisnya dijaga oleh penulis data.
  stockQuantity: z.number().int(),
  minStock: z.number().int().nonnegative().nullable(),
  purchasePrice: z.number().int().nonnegative(),
  sellingPrice: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  // null = produk aktif; terisi = diarsipkan (disembunyikan dari katalog tanpa menghapus riwayatnya).
  archivedAt: z.iso.datetime().nullable(),
});

export const stockMovementTypeSchema = z.enum(['awal', 'masuk', 'koreksi', 'jual', 'retur', 'batal']);

// Selisih tidak disimpan; dihitung dari quantityAfter - quantityBefore.
// seq naik terus untuk seluruh pergerakan; memberi urutan pasti walau createdAt sama.
export const stockMovementSchema = z.object({
  id: z.uuid(),
  seq: z.number().int().min(1),
  productId: z.uuid(),
  type: stockMovementTypeSchema,
  quantityBefore: z.number().int(),
  quantityAfter: z.number().int(),
  reason: z.string().min(3),
  actor: z.string().min(1),
  createdAt: z.iso.datetime(),
  // Hanya ada pada pergerakan bertipe 'jual'; data lama tanpa field ini tetap valid.
  saleId: z.uuid().optional(),
});

export const STOCK_MOVEMENT_COUNTER = 'stockMovement';

export const counterSchema = z.object({
  name: z.string().min(1),
  value: z.number().int().nonnegative(),
});

const money = z.number().int().nonnegative();

export const paymentMethodSchema = z.enum(['tunai', 'transfer', 'qris']);

export const saleStatusSchema = z.enum(['selesai', 'dibatalkan']);

export const saleSchema = z
  .object({
    id: z.uuid(),
    number: z.string().regex(/^TRX-\d{8}-\d{4,}$/),
    paymentMethod: paymentMethodSchema,
    subtotal: money,
    itemDiscountTotal: money,
    transactionDiscount: money,
    total: money,
    amountPaid: money,
    change: money,
    itemCount: z.number().int().min(1),
    actor: z.string().min(1),
    createdAt: z.iso.datetime(),
    status: saleStatusSchema,
    // Total uang yang sudah dikembalikan lewat retur; disimpan di kepala agar ringkasan omzet tidak menjumlah ulang.
    refundedTotal: money,
    cancelledAt: z.iso.datetime().optional(),
    cancelReason: z.string().min(3).optional(),
    cancelledBy: z.string().min(1).optional(),
  })
  .refine((sale) => sale.refundedTotal <= sale.total, {
    path: ['refundedTotal'],
    message: 'Total retur tidak boleh melebihi total transaksi.',
  });

export const saleReturnSchema = z.object({
  id: z.uuid(),
  number: z.string().regex(/^RTR-\d{8}-\d{4,}$/),
  saleId: z.uuid(),
  items: z
    .array(
      z.object({
        saleItemId: z.uuid(),
        quantity: z.number().int().min(1),
        refundAmount: money,
      }),
    )
    .min(1),
  refundTotal: money,
  reason: z.string().min(3),
  actor: z.string().min(1),
  createdAt: z.iso.datetime(),
});

// Salinan nama, SKU, satuan, dan harga saat transaksi: transaksi lama tidak berubah walau produk diubah.
export const saleItemSchema = z.object({
  id: z.uuid(),
  saleId: z.uuid(),
  productId: z.uuid(),
  productName: z.string().min(1),
  sku: z.string().min(1),
  unit: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: money,
  unitCost: money,
  discount: money,
});

export const hashedSecretSchema = z.object({
  hash: z.string().min(1),
  salt: z.string().min(1),
  iterations: z.number().int().positive(),
});

export const pinAttemptsSchema = z.object({
  failed: z.number().int().nonnegative(),
  lockedUntil: z.iso.datetime().nullable(),
});

// Kosong = belum diisi: alamat dan telepon "" (bukan null) supaya form dan kop memakai satu bentuk teks.
export const storeProfileSchema = z.object({
  name: z.string().min(2).max(60),
  address: z.string().max(200),
  phone: z.string().max(20),
  logo: z.object({ blob: z.instanceof(Blob), width: z.number().int().positive(), height: z.number().int().positive() }).nullable(),
});

export const settingSchema = z.discriminatedUnion('key', [
  z.object({ key: z.literal('allowOversell'), value: z.boolean() }),
  z.object({ key: z.literal('cashierMode'), value: z.boolean() }),
  z.object({ key: z.literal('defaultMinStock'), value: z.number().int().min(1).max(1000) }),
  z.object({ key: z.literal('alertsBellEnabled'), value: z.boolean() }),
  z.object({ key: z.literal('dailySummaryEnabled'), value: z.boolean() }),
  z.object({ key: z.literal('alertsInCashierMode'), value: z.boolean() }),
  z.object({ key: z.literal('dailySummaryDismissedOn'), value: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable() }),
  z.object({ key: z.literal('ownerPin'), value: hashedSecretSchema }),
  z.object({ key: z.literal('recoveryCode'), value: hashedSecretSchema }),
  z.object({ key: z.literal('pinAttempts'), value: pinAttemptsSchema }),
  z.object({ key: z.literal('storeProfile'), value: storeProfileSchema }),
  // Versi aplikasi yang sudah diberitahukan lewat toast, dan versi yang halaman Pembaruannya sudah dibuka.
  z.object({ key: z.literal('notifiedVersion'), value: z.string() }),
  z.object({ key: z.literal('changelogSeenVersion'), value: z.string() }),
  // Data contoh (demo): penanda bahwa isi database berasal dari seed, dan PIN Mode Kasir yang dibuatkan untuknya.
  z.object({ key: z.literal('isDemo'), value: z.boolean() }),
  z.object({ key: z.literal('demoPin'), value: z.string() }),
]);

// Rekap per tanggal lokal (YYYY-MM-DD), hanya dari transaksi yang tidak dibatalkan.
// cogs = harga pokok bersih setelah retur; omzet = grossTotal - refundedTotal.
export const dailySalesSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  transactionCount: z.number().int().nonnegative(),
  grossTotal: money,
  refundedTotal: money,
  cogs: money,
});

// Satu baris per (tanggal lokal, produk), hanya yang punya penjualan bersih. quantity = terjual - retur;
// revenue = nilai bersih baris (sudah termasuk bagian diskon transaksi) - uang retur baris; cogs = HPP bersih.
export const dailyProductSalesSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  productId: z.uuid(),
  quantity: z.number().int().nonnegative(),
  revenue: money,
  cogs: money,
});

export const stockAlertLevelSchema = z.enum(['menipis', 'habis']);

// Satu "episode" peringatan per produk: dibuka saat stok turun ke menipis/habis, ditutup saat kembali aman atau diarsipkan.
// isOpen (1/0) ada karena IndexedDB tidak bisa mengindeks null atau boolean; selalu sama dengan resolvedAt === null.
export const stockAlertSchema = z
  .object({
    id: z.uuid(),
    productId: z.uuid(),
    level: stockAlertLevelSchema,
    openedAt: z.iso.datetime(),
    resolvedAt: z.iso.datetime().nullable(),
    readAt: z.iso.datetime().nullable(),
    isOpen: z.union([z.literal(0), z.literal(1)]),
  })
  .refine((alert) => (alert.isOpen === 1) === (alert.resolvedAt === null), {
    path: ['isOpen'],
    message: 'isOpen harus 1 tepat ketika resolvedAt kosong.',
  });

export type Product = z.infer<typeof productSchema>;
export type StockMovement = z.infer<typeof stockMovementSchema>;
export type Counter = z.infer<typeof counterSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type Sale = z.infer<typeof saleSchema>;
export type SaleItem = z.infer<typeof saleItemSchema>;
export type Setting = z.infer<typeof settingSchema>;
export type StoreProfile = z.infer<typeof storeProfileSchema>;
export type HashedSecret = z.infer<typeof hashedSecretSchema>;
export type SaleReturn = z.infer<typeof saleReturnSchema>;
export type DailySales = z.infer<typeof dailySalesSchema>;
export type DailyProductSales = z.infer<typeof dailyProductSalesSchema>;
export type StockAlert = z.infer<typeof stockAlertSchema>;
export type StockAlertLevel = z.infer<typeof stockAlertLevelSchema>;

export const priceChangeSchema = z.object({
  id: z.uuid(),
  seq: z.number().int().min(1),
  productId: z.uuid(),
  field: z.enum(['purchasePrice', 'sellingPrice']),
  before: z.number().int().nonnegative(),
  after: z.number().int().nonnegative(),
  actor: z.string().min(1),
  createdAt: z.iso.datetime(),
});

// Foto disimpan di tabel terpisah dari produk supaya daftar ribuan barang tetap ringan.
export const productPhotoSchema = z.object({
  productId: z.uuid(),
  blob: z.instanceof(Blob),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  updatedAt: z.iso.datetime(),
});

export const PRICE_CHANGE_COUNTER = 'priceChange';

export type PriceChange = z.infer<typeof priceChangeSchema>;
export type ProductPhoto = z.infer<typeof productPhotoSchema>;

// nameKey = bentuk pembanding nama kategori; "sembako" dan "Sembako" harus menghasilkan kunci yang sama.
export const categorySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  nameKey: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Category = z.infer<typeof categorySchema>;

// Satu-satunya cara membuat nameKey.
export function toCategoryKey(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('id');
}
