import { z } from 'zod';

const returnStateSchema = z.object({ search: z.string().regex(/^(\?.*)?$/) });

// Halaman daftar menitipkan query string-nya lewat location.state agar filter pulih saat kembali.
export function getReturnPath(locationState: unknown, basePath: string): string {
  const result = returnStateSchema.safeParse(locationState);
  return result.success ? `${basePath}${result.data.search}` : basePath;
}
