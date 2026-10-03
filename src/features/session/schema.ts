import { z } from 'zod';

export const pinSchema = z.string().regex(/^\d{4,6}$/, 'PIN harus 4–6 angka.');

// Dua kali isi PIN baru: salah ketik tidak boleh mengunci pemilik dari PIN yang tidak ia ketahui.
export const newPinSchema = z
  .object({ newPin: pinSchema, confirmPin: z.string() })
  .refine((values) => values.newPin === values.confirmPin, {
    path: ['confirmPin'],
    message: 'Isi ulang PIN harus sama dengan PIN baru.',
  });
