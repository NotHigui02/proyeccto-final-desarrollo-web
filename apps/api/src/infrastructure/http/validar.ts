import type { z } from 'zod';

/** Valida datos con un esquema Zod. Si falla, lanza `ZodError` → 400 con detalles por campo. */
export function validar<TSchema extends z.ZodType>(
  esquema: TSchema,
  datos: unknown,
): z.infer<TSchema> {
  return esquema.parse(datos);
}
