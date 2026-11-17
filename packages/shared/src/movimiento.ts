import { z } from 'zod';
import { montoCentavosSchema } from './dinero.js';
import { crearFechaMovimientoSchema, fechaMovimientoSchema, type Reloj } from './fecha.js';
import { mesSchema } from './mes.js';

export const tipoMovimientoSchema = z.enum(['ingreso', 'gasto']);

export function crearMovimientoEntradaSchema(hoy?: Reloj) {
  return z.strictObject({
    tipo: tipoMovimientoSchema,
    montoCentavos: montoCentavosSchema,
    categoriaId: z.string().min(1, 'La categoría es obligatoria'),
    nota: z.string().trim().max(200, 'La nota no puede superar 200 caracteres').nullable(),
    fecha: hoy ? crearFechaMovimientoSchema(hoy) : fechaMovimientoSchema,
    comprobanteUrl: z.null(),
  });
}

export const movimientoEntradaSchema = crearMovimientoEntradaSchema();

export const movimientoSchema = movimientoEntradaSchema.extend({
  id: z.string().min(1),
});

export const filtrosMovimientosSchema = z.strictObject({
  mes: mesSchema.optional(),
  tipo: tipoMovimientoSchema.optional(),
  categoriaId: z.string().min(1).optional(),
});

export type TipoMovimiento = z.infer<typeof tipoMovimientoSchema>;
export type MovimientoEntrada = z.infer<typeof movimientoEntradaSchema>;
export type Movimiento = z.infer<typeof movimientoSchema>;
export type FiltrosMovimientos = z.infer<typeof filtrosMovimientosSchema>;
