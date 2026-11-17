import { z } from 'zod';
import type { Categoria } from './categoria.js';
import { mesSchema, type Mes } from './mes.js';
import type { Movimiento } from './movimiento.js';
import { presupuestoSchema } from './presupuesto.js';

export const gastoPorCategoriaSchema = z.strictObject({
  categoriaId: z.string().min(1),
  nombre: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  gastoCentavos: z.number().int().nonnegative(),
});

export const puntoEvolucionSchema = z.strictObject({
  mes: mesSchema,
  ingresosCentavos: z.number().int().nonnegative(),
  gastosCentavos: z.number().int().nonnegative(),
});

export const resumenSchema = z.strictObject({
  mes: mesSchema,
  ingresosCentavos: z.number().int().nonnegative(),
  gastosCentavos: z.number().int().nonnegative(),
  saldoCentavos: z.number().int(),
  porCategoria: z.array(gastoPorCategoriaSchema),
  evolucion: z.array(puntoEvolucionSchema),
  presupuesto: presupuestoSchema.nullable().optional(),
});

export type GastoPorCategoria = z.infer<typeof gastoPorCategoriaSchema>;
export type PuntoEvolucion = z.infer<typeof puntoEvolucionSchema>;
export type Resumen = z.infer<typeof resumenSchema>;

/**
 * Calcula totales del mes con aritmética entera de centavos (sin decimales).
 * Solo suma gastos en `porCategoria`; las categorías sin gasto no aparecen.
 */
export function calcularTotalesMes(
  movimientos: readonly Movimiento[],
  categorias: readonly Categoria[],
): Omit<Resumen, 'mes' | 'evolucion'> {
  const porId = new Map(categorias.map((categoria) => [categoria.id, categoria]));
  let ingresosCentavos = 0;
  let gastosCentavos = 0;
  const gastoPorCategoria = new Map<string, number>();

  for (const movimiento of movimientos) {
    if (movimiento.tipo === 'ingreso') {
      ingresosCentavos += movimiento.montoCentavos;
    } else {
      gastosCentavos += movimiento.montoCentavos;
      gastoPorCategoria.set(
        movimiento.categoriaId,
        (gastoPorCategoria.get(movimiento.categoriaId) ?? 0) + movimiento.montoCentavos,
      );
    }
  }

  const porCategoria: GastoPorCategoria[] = [...gastoPorCategoria.entries()]
    .map(([categoriaId, gastoCentavosCategoria]) => {
      const categoria = porId.get(categoriaId);
      return {
        categoriaId,
        nombre: categoria?.nombre ?? 'Sin categoría',
        color: categoria?.color ?? '#888888',
        gastoCentavos: gastoCentavosCategoria,
      };
    })
    .sort((a, b) => b.gastoCentavos - a.gastoCentavos || a.nombre.localeCompare(b.nombre, 'es'));

  return {
    ingresosCentavos,
    gastosCentavos,
    saldoCentavos: ingresosCentavos - gastosCentavos,
    porCategoria,
  };
}

export function calcularResumen(
  mes: Mes,
  movimientos: readonly Movimiento[],
  categorias: readonly Categoria[],
  evolucion: readonly PuntoEvolucion[] = [],
): Resumen {
  return {
    mes,
    ...calcularTotalesMes(movimientos, categorias),
    evolucion: [...evolucion],
  };
}
