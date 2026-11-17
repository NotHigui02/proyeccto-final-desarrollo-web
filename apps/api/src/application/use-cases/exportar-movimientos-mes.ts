import { generarCSV, rangoDelMes, type Mes } from '@gastos/shared';
import type { RepositorioCategorias } from '../ports/repositorio-categorias.js';
import type { RepositorioMovimientos } from '../ports/repositorio-movimientos.js';

export interface ExportacionCsv {
  csv: string;
  nombreArchivo: string;
}

export class ExportarMovimientosMes {
  constructor(
    private readonly categorias: RepositorioCategorias,
    private readonly movimientos: RepositorioMovimientos,
  ) {}

  async ejecutar(uid: string, mes: Mes): Promise<ExportacionCsv> {
    const { desde, hasta } = rangoDelMes(mes);
    const [categorias, movimientos] = await Promise.all([
      this.categorias.listar(uid),
      this.movimientos.listarPorRango(uid, desde, hasta),
    ]);

    return {
      csv: generarCSV(movimientos, categorias),
      nombreArchivo: `movimientos-${mes}.csv`,
    };
  }
}
