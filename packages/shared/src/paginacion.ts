import { z } from 'zod';

export const paginacionSchema = z.strictObject({
  limite: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
});

export type Paginacion = z.infer<typeof paginacionSchema>;

export interface Pagina<T> {
  items: T[];
  siguienteCursor: string | null;
}
