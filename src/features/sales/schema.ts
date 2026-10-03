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
