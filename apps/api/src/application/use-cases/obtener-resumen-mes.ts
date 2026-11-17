import {
  calcularResumen,
  mesAnterior,
  mesDeFecha,
  rangoDelMes,
  type Mes,
  type Movimiento,
  type Resumen,
} from '@gastos/shared';
import type { RepositorioCategorias } from '../ports/repositorio-categorias.js';
import type { RepositorioMovimientos } from '../ports/repositorio-movimientos.js';
import type { RepositorioPresupuestos } from '../ports/repositorio-presupuestos.js';

const MESES_EVOLUCION = 6;

export class ObtenerResumenMes {
  constructor(
    private readonly categorias: RepositorioCategorias,
    private readonly movimientos: RepositorioMovimientos,
    private readonly presupuestos?: RepositorioPresupuestos,
  ) {}

  async ejecutar(uid: string, mes: Mes): Promise<Resumen> {
    const [categorias, movimientos, presupuesto] = await Promise.all([
      this.categorias.listar(uid),
      this.movimientosEnVentana(uid, mes),
      this.presupuestos?.obtener(uid, mes) ?? Promise.resolve(null),
    ]);
    const delMes = movimientos.filter((movimiento) => mesDeFecha(movimiento.fecha) === mes);
    const evolucion = this.construirEvolucion(mes, movimientos);
    return {
      ...calcularResumen(mes, delMes, categorias, evolucion),
      presupuesto: presupuesto ?? null,
    };
  }

  private async movimientosEnVentana(uid: string, mes: Mes): Promise<readonly Movimiento[]> {
    let desdeMes: Mes = mes;
    for (let i = 1; i < MESES_EVOLUCION; i += 1) {
      desdeMes = mesAnterior(desdeMes);
    }
    const { desde } = rangoDelMes(desdeMes);
    const { hasta } = rangoDelMes(mes);
    return this.movimientos.listarPorRango(uid, desde, hasta);
  }

  private construirEvolucion(mes: Mes, movimientos: readonly Movimiento[]) {
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
