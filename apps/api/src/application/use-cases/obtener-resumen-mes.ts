import { calcularResumen, mesAnterior, mesDeFecha, type Mes, type Resumen } from '@gastos/shared';
import type { RepositorioDatos } from '../ports/repositorio-datos.js';

const MESES_EVOLUCION = 6;

export class ObtenerResumenMes {
  constructor(private readonly datos: RepositorioDatos) {}

  async ejecutar(mes: Mes): Promise<Resumen> {
    const [categorias, movimientos] = await Promise.all([
      this.datos.listarCategorias(),
      this.datos.listarMovimientos(),
    ]);

    const delMes = movimientos.filter((movimiento) => mesDeFecha(movimiento.fecha) === mes);
    const evolucion = this.construirEvolucion(mes, movimientos);

    return calcularResumen(mes, delMes, categorias, evolucion);
  }

  private construirEvolucion(
    mes: Mes,
    movimientos: readonly { fecha: string; tipo: string; montoCentavos: number }[],
  ) {
    const puntos = [];
    let actual: Mes = mes;

    for (let i = 0; i < MESES_EVOLUCION; i += 1) {
      const delMes = movimientos.filter((movimiento) => mesDeFecha(movimiento.fecha) === actual);
      let ingresosCentavos = 0;
      let gastosCentavos = 0;
      for (const movimiento of delMes) {
        if (movimiento.tipo === 'ingreso') ingresosCentavos += movimiento.montoCentavos;
        else gastosCentavos += movimiento.montoCentavos;
      }
      puntos.unshift({ mes: actual, ingresosCentavos, gastosCentavos });
      actual = mesAnterior(actual);
    }

    return puntos;
  }
}
