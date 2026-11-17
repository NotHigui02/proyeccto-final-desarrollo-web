import { z } from 'zod';

export const colorHexSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe tener el formato #RRGGBB');

export const categoriaEntradaSchema = z.strictObject({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(40, 'El nombre no puede superar 40 caracteres'),
  color: colorHexSchema,
});

export const categoriaSchema = categoriaEntradaSchema.extend({
  id: z.string().min(1),
});

export type CategoriaEntrada = z.infer<typeof categoriaEntradaSchema>;
export type Categoria = z.infer<typeof categoriaSchema>;
