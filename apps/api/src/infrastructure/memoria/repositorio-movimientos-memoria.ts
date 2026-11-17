import type { Movimiento } from '@gastos/shared';
import type { RepositorioMovimientos } from '../../application/ports/repositorio-movimientos.js';
import { MOVIMIENTOS_SEMILLA, UID_DEMO } from './semilla.js';

export class RepositorioMovimientosMemoria implements RepositorioMovimientos {
  private readonly porUsuario = new Map<string, Movimiento[]>();

  constructor(semilla: readonly Movimiento[] = MOVIMIENTOS_SEMILLA, uid = UID_DEMO) {
    this.porUsuario.set(
      uid,
      semilla.map((movimiento) => ({ ...movimiento })),
    );
  }

  contarPorCategoria(uid: string, categoriaId: string): Promise<number> {
    const movimientos = this.porUsuario.get(uid) ?? [];
    return Promise.resolve(
      movimientos.filter((movimiento) => movimiento.categoriaId === categoriaId).length,
    );
  }

  /** Usado por el resumen de ejemplo hasta el spec 07. */
  listarTodos(uid: string): Promise<readonly Movimiento[]> {
    return Promise.resolve([...(this.porUsuario.get(uid) ?? [])]);
  }
}
