import type { Categoria } from './categoria.js';
import type { Mes } from './mes.js';
import type { Movimiento } from './movimiento.js';

export interface GastoPorCategoria {
  categoriaId: string;
  nombre: string;
  color: string;
  gastoCentavos: number;
}

export interface Resumen {
  mes: Mes;
  ingresosCentavos: number;
  gastosCentavos: number;
  saldoCentavos: number;
  porCategoria: GastoPorCategoria[];
}

/**
 * Calcula totales del mes con aritmética entera de centavos (sin decimales).
 * Solo suma gastos en `porCategoria`; las categorías sin gasto no aparecen.
 */
export function calcularResumen(
  mes: Mes,
  movimientos: readonly Movimiento[],
  categorias: readonly Categoria[],
): Resumen {
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
    .map(([categoriaId, gastoCentavos]) => {
      const categoria = porId.get(categoriaId);
      return {
        categoriaId,
        nombre: categoria?.nombre ?? 'Sin categoría',
        color: categoria?.color ?? '#888888',
        gastoCentavos,
      };
    })
    .sort((a, b) => b.gastoCentavos - a.gastoCentavos || a.nombre.localeCompare(b.nombre, 'es'));

  return {
    mes,
    ingresosCentavos,
    gastosCentavos,
    saldoCentavos: ingresosCentavos - gastosCentavos,
    porCategoria,
  };
}
