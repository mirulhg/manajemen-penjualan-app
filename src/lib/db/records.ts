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
// seq naik terus untuk seluruh pergerakan; memberi urutan pasti walau createdAt sama.
export const stockMovementSchema = z.object({
  id: z.uuid(),
  seq: z.number().int().min(1),
  productId: z.uuid(),
  type: stockMovementTypeSchema,
  quantityBefore: z.number().int().nonnegative(),
  quantityAfter: z.number().int().nonnegative(),
  reason: z.string().min(3),
  actor: z.string().min(1),
  createdAt: z.iso.datetime(),
});

export const STOCK_MOVEMENT_COUNTER = 'stockMovement';

export const counterSchema = z.object({
  name: z.string().min(1),
  value: z.number().int().nonnegative(),
});

export type Product = z.infer<typeof productSchema>;
export type StockMovement = z.infer<typeof stockMovementSchema>;
export type Counter = z.infer<typeof counterSchema>;
