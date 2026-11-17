import type { Categoria, CategoriaEntrada } from '@gastos/shared';
import { ErrorConflicto, ErrorNoEncontrado } from '../../domain/errors/errores-dominio.js';
import type { RepositorioCategorias } from '../ports/repositorio-categorias.js';

export class ActualizarCategoria {
  constructor(private readonly categorias: RepositorioCategorias) {}

  async ejecutar(uid: string, id: string, entrada: CategoriaEntrada): Promise<Categoria> {
    const actual = await this.categorias.obtener(uid, id);
    if (!actual) {
      throw new ErrorNoEncontrado('Categoría no encontrada');
    }
    if (await this.categorias.existeNombre(uid, entrada.nombre, id)) {
      throw new ErrorConflicto('Ya existe una categoría con ese nombre');
    }
    return this.categorias.actualizar(uid, id, entrada);
  }
}
