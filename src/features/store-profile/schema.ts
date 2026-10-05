import { z } from 'zod';

export const storeProfileFormSchema = z.object({
  name: z.string().trim().min(2, 'Tulis nama toko minimal 2 karakter.').max(60, 'Nama toko maksimal 60 karakter.'),
  address: z.string().trim().max(200, 'Alamat maksimal 200 karakter.'),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || /^[0-9+\- ]{6,20}$/.test(value), {
      message: 'Telepon hanya boleh angka, +, spasi, atau tanda hubung (6–20 karakter).',
    }),
});

export type StoreProfileFormInput = z.input<typeof storeProfileFormSchema>;
export type StoreProfileFormValues = z.output<typeof storeProfileFormSchema>;

export const LOGO_MAX_SIDE = 400;

export type StoreLogo = { blob: Blob; width: number; height: number };

// Pilihan logo yang belum disimpan, sama polanya dengan foto barang.
export type LogoDraft = { kind: 'unchanged' } | { kind: 'replace'; logo: StoreLogo } | { kind: 'remove' };
