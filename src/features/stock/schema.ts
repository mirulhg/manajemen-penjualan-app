import { z } from 'zod';

import { parseRupiah } from '../../utils/parse-rupiah';

export const productSchema = z.object({
  id: z.uuid(),
  sku: z
    .string()
    .min(1)
    .refine((sku) => sku === sku.toUpperCase(), 'SKU harus huruf besar'),
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1),
  stockQuantity: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative().nullable(),
  purchasePrice: z.number().int().nonnegative(),
  sellingPrice: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const stockMovementTypeSchema = z.enum(['awal', 'masuk', 'koreksi']);

// Selisih tidak disimpan; dihitung dari quantityAfter - quantityBefore.
export const stockMovementSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  type: stockMovementTypeSchema,
  quantityBefore: z.number().int().nonnegative(),
  quantityAfter: z.number().int().nonnegative(),
  reason: z.string().min(3),
  actor: z.string().min(1),
  createdAt: z.iso.datetime(),
});

export type Product = z.infer<typeof productSchema>;
export type StockMovement = z.infer<typeof stockMovementSchema>;

export const MAX_ADJUSTMENT_QUANTITY = 100_000;

export const adjustmentQuantitySchema = z
  .string()
  .trim()
  .min(1, 'Isi jumlah barang.')
  .regex(/^\d+$/, 'Jumlah harus bilangan bulat tanpa koma.')
  .transform(Number)
  .pipe(z.number().max(MAX_ADJUSTMENT_QUANTITY, 'Jumlah terlalu besar. Periksa kembali angkanya.'));

// Jumlah diterima sebagai teks karena form memakai input teks; konversi ke angka terjadi di sini.
export const stockAdjustmentSchema = z
  .object({
    type: z.enum(['masuk', 'koreksi']),
    quantity: adjustmentQuantitySchema,
    reason: z
      .string()
      .trim()
      .min(3, 'Tulis alasan minimal 3 karakter.')
      .max(200, 'Alasan maksimal 200 karakter.'),
  })
  .refine((adjustment) => adjustment.type !== 'masuk' || adjustment.quantity >= 1, {
    path: ['quantity'],
    message: 'Jumlah masuk minimal 1.',
  });

export type StockAdjustmentInput = z.input<typeof stockAdjustmentSchema>;
export type StockAdjustment = z.output<typeof stockAdjustmentSchema>;

const MAX_PRICE = 100_000_000;

const priceSchema = z.string().trim().transform((value, ctx) => {
  const amount = value === '' ? null : parseRupiah(value);
  if (value !== '' && amount === null) {
    ctx.addIssue({ code: 'custom', message: 'Harga harus berupa angka, misalnya 12500 atau 12.500.' });
    return z.NEVER;
  }
  if (amount === null || amount < 1) {
    ctx.addIssue({ code: 'custom', message: 'Isi harga lebih dari 0.' });
    return z.NEVER;
  }
  if (amount > MAX_PRICE) {
    ctx.addIssue({ code: 'custom', message: 'Harga terlalu besar. Periksa kembali angkanya.' });
    return z.NEVER;
  }
  return amount;
});

// Batas minimum boleh kosong (null = memakai batas default global).
const optionalMinStockSchema = z.string().transform((value, ctx) => {
  if (value.trim() === '') return null;
  const result = adjustmentQuantitySchema.safeParse(value);
  if (result.success) return result.data;
  for (const issue of result.error.issues) {
    ctx.addIssue({ code: 'custom', message: issue.message });
  }
  return z.NEVER;
});

export const newProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Tulis nama barang minimal 2 karakter.')
    .max(100, 'Nama barang maksimal 100 karakter.'),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{2,32}$/, 'SKU hanya boleh huruf, angka, dan tanda hubung (2–32 karakter).'),
  category: z.string().trim().min(2, 'Isi kategori barang.').max(50, 'Kategori maksimal 50 karakter.'),
  unit: z
    .string()
    .trim()
    .min(1, 'Isi satuan barang, misalnya pcs atau bungkus.')
    .max(20, 'Satuan maksimal 20 karakter.'),
  initialStock: adjustmentQuantitySchema,
  minStock: optionalMinStockSchema,
  purchasePrice: priceSchema,
  sellingPrice: priceSchema,
});

export type NewProductInput = z.input<typeof newProductSchema>;
export type NewProduct = z.output<typeof newProductSchema>;
