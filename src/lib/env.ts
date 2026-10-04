import { z } from 'zod';

const envSchema = z.object({
  VITE_SEED_SAMPLE_DATA: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  VITE_SEED_SAMPLE_SALES: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  VITE_SEED_EXTRA_PRODUCTS: z.coerce.number().int().min(0).max(5000).default(0),
});

// Dipanggil saat start, bukan saat modul dimuat, supaya env yang salah bisa ditampilkan sebagai pesan error.
export function getEnv() {
  return envSchema.parse(import.meta.env);
}
