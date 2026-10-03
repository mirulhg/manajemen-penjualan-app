import { z } from 'zod';

export const pinSchema = z.string().regex(/^\d{4,6}$/, 'PIN harus 4–6 angka.');
