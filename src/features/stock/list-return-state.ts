import { z } from 'zod';

const listReturnStateSchema = z.object({ search: z.string().regex(/^(\?.*)?$/) });

// Daftar stok menitipkan query string-nya lewat location.state agar filter pulih saat kembali.
export function getListPath(locationState: unknown): string {
  const result = listReturnStateSchema.safeParse(locationState);
  return result.success ? `/stok${result.data.search}` : '/stok';
}
