import { z } from 'zod';

import { paymentMethodSchema } from '../../lib/db/records';

const MAX_ITEMS = 100;
const MAX_QUANTITY = 100_000;

const saleItemInputSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
  discount: z.number().int().nonnegative(),
});

export const createSaleInputSchema = z
  .object({
    items: z.array(saleItemInputSchema).min(1, 'Keranjang kosong.').max(MAX_ITEMS),
    paymentMethod: paymentMethodSchema,
    transactionDiscount: z.number().int().nonnegative(),
    amountPaid: z.number().int().nonnegative().optional(),
    // Total yang dilihat kasir; ditolak bila harga di database sudah berubah sejak itu.
    expectedTotal: z.number().int().nonnegative(),
  })
  .refine((input) => new Set(input.items.map((item) => item.productId)).size === input.items.length, {
    path: ['items'],
    message: 'Satu barang tidak boleh muncul dua kali di keranjang.',
  })
  .refine((input) => input.paymentMethod !== 'tunai' || input.amountPaid !== undefined, {
    path: ['amountPaid'],
    message: 'Isi uang diterima untuk pembayaran tunai.',
  });

export type CreateSaleInput = z.input<typeof createSaleInputSchema>;

const reasonSchema = z
  .string()
  .trim()
  .min(3, 'Tulis alasan minimal 3 karakter.')
  .max(200, 'Alasan maksimal 200 karakter.');

export const returnSaleItemsInputSchema = z
  .object({
    items: z
      .array(
        z.object({
          saleItemId: z.uuid(),
          quantity: z.number().int().min(1).max(MAX_QUANTITY),
        }),
      )
      .min(1, 'Pilih barang yang diretur.'),
    reason: reasonSchema,
  })
  .refine((input) => new Set(input.items.map((item) => item.saleItemId)).size === input.items.length, {
    path: ['items'],
    message: 'Satu barang tidak boleh muncul dua kali dalam satu retur.',
  });

export const cancelSaleInputSchema = z.object({ reason: reasonSchema });

export type ReturnSaleItemsInput = z.input<typeof returnSaleItemsInputSchema>;

// Jumlah retur di form berupa teks; kosong berarti 0 (barang itu tidak diretur).
const returnQuantityTextSchema = z.string().transform((text, ctx) => {
  const value = text.trim();
  if (value === '') return 0;
  if (!/^\d+$/.test(value)) {
    ctx.addIssue({ code: 'custom', message: 'Jumlah harus bilangan bulat tanpa koma.' });
    return z.NEVER;
  }
  return Number(value);
});

// remaining sejajar dengan baris form: sisa jumlah yang masih bisa diretur per baris.
export function buildReturnFormSchema(remaining: number[]) {
  return z
    .object({
      items: z.array(z.object({ saleItemId: z.string(), quantity: returnQuantityTextSchema })),
      reason: reasonSchema,
    })
    .superRefine((value, ctx) => {
      value.items.forEach((item, index) => {
        const limit = remaining[index] ?? 0;
        if (item.quantity > limit) {
          ctx.addIssue({
            code: 'custom',
            path: ['items', index, 'quantity'],
            message: `Jumlah retur melebihi sisa (${limit}).`,
          });
        }
      });
      if (!value.items.some((item) => item.quantity > 0)) {
        ctx.addIssue({
          code: 'custom',
          path: ['items'],
          message: 'Isi jumlah retur untuk minimal satu barang.',
        });
      }
    });
}

export type ReturnFormInput = { items: { saleItemId: string; quantity: string }[]; reason: string };
export type ReturnFormValues = z.output<ReturnType<typeof buildReturnFormSchema>>;
