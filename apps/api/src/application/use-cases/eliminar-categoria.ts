import { ErrorConflicto, ErrorNoEncontrado } from '../../domain/errors/errores-dominio.js';
import type { RepositorioCategorias } from '../ports/repositorio-categorias.js';
import type { RepositorioMovimientos } from '../ports/repositorio-movimientos.js';

export class EliminarCategoria {
  constructor(
    private readonly categorias: RepositorioCategorias,
    private readonly movimientos: RepositorioMovimientos,
  ) {}

  async ejecutar(uid: string, id: string): Promise<void> {
    const actual = await this.categorias.obtener(uid, id);
    if (!actual) {
      throw new ErrorNoEncontrado('Categoría no encontrada');
    }
    const cantidad = await this.movimientos.contarPorCategoria(uid, id);
    if (cantidad > 0) {
      throw new ErrorConflicto('No se puede borrar una categoría con movimientos');
    }
    await this.categorias.eliminar(uid, id);
  }
}
