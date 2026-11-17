import { z } from 'zod';
import { montoCentavosSchema } from './dinero.js';
import { mesSchema } from './mes.js';

export const nivelPresupuestoSchema = z.enum(['normal', 'alerta', 'excedido']);

export const presupuestoEntradaSchema = z.strictObject({
  montoCentavos: montoCentavosSchema,
});

export const presupuestoSchema = z.strictObject({
  mes: mesSchema,
  montoCentavos: montoCentavosSchema,
});

export type NivelPresupuesto = z.infer<typeof nivelPresupuestoSchema>;
export type PresupuestoEntrada = z.infer<typeof presupuestoEntradaSchema>;
export type Presupuesto = z.infer<typeof presupuestoSchema>;

export interface EstadoPresupuesto {
  porcentaje: number;
  nivel: NivelPresupuesto;
}

/**
 * Calcula el % de gasto respecto al presupuesto con aritmética entera.
 * `alerta` desde 80 % inclusive; `excedido` desde 100 % inclusive.
 */
export function estadoPresupuesto(
  gastadoCentavos: number,
  presupuestoCentavos: number,
): EstadoPresupuesto {
  if (
    !Number.isInteger(gastadoCentavos) ||
    !Number.isInteger(presupuestoCentavos) ||
    gastadoCentavos < 0 ||
    presupuestoCentavos <= 0
  ) {
    throw new RangeError('Gastado y presupuesto deben ser enteros válidos de centavos');
  }

  const porcentaje = Math.trunc((gastadoCentavos * 100) / presupuestoCentavos);
  const nivel: NivelPresupuesto =
    porcentaje < 80 ? 'normal' : porcentaje < 100 ? 'alerta' : 'excedido';

  return { porcentaje, nivel };
}
