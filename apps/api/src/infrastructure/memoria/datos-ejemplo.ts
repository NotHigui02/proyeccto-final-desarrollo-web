import type { Categoria, Movimiento } from '@gastos/shared';
import type { RepositorioDatos } from '../../application/ports/repositorio-datos.js';
import type { RepositorioCategoriasMemoria } from './repositorio-categorias-memoria.js';
import type { RepositorioMovimientosMemoria } from './repositorio-movimientos-memoria.js';
import { UID_DEMO } from './semilla.js';

/** Adaptador de lectura para el resumen; reutiliza los repositorios en memoria. */
export class RepositorioDatosEjemplo implements RepositorioDatos {
  constructor(
    private readonly categorias: RepositorioCategoriasMemoria,
    private readonly movimientos: RepositorioMovimientosMemoria,
    private readonly uid = UID_DEMO,
  ) {}

  listarCategorias(): Promise<readonly Categoria[]> {
    return this.categorias.listar(this.uid);
  }

  listarMovimientos(): Promise<readonly Movimiento[]> {
    return this.movimientos.listarTodos(this.uid);
  }
}
