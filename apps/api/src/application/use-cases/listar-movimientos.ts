import type { FiltrosMovimientos, Movimiento, Pagina, Paginacion } from '@gastos/shared';
import type { RepositorioMovimientos } from '../ports/repositorio-movimientos.js';

export class ListarMovimientos {
  constructor(private readonly movimientos: RepositorioMovimientos) {}

  ejecutar(
    uid: string,
    filtros: FiltrosMovimientos,
    paginacion: Paginacion,
  ): Promise<Pagina<Movimiento>> {
    return this.movimientos.listar(uid, filtros, paginacion);
  }
}
