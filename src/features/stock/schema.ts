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

const adjustmentQuantitySchema = z
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
