import { z } from 'zod';

export const pinSchema = z.string().regex(/^\d{4,6}$/, 'PIN harus 4–6 angka.');

// Dua kali isi PIN baru: salah ketik tidak boleh mengunci pemilik dari PIN yang tidak ia ketahui.
export const newPinSchema = z
  .object({ newPin: pinSchema, confirmPin: z.string() })
  .refine((values) => values.newPin === values.confirmPin, {
    path: ['confirmPin'],
    message: 'Isi ulang PIN harus sama dengan PIN baru.',
  });

// Batas menipis default: bilangan bulat 1-1000 (teks dari form).
export const defaultMinStockSchema = z.object({
  defaultMinStock: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Isi batas berupa bilangan bulat antara 1 dan 1.000.')
    .transform(Number)
    .pipe(z.number().min(1, 'Isi batas berupa bilangan bulat antara 1 dan 1.000.').max(1000, 'Isi batas berupa bilangan bulat antara 1 dan 1.000.')),
});
export type DefaultMinStockInput = z.input<typeof defaultMinStockSchema>;
