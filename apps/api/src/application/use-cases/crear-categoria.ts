import type { Categoria, CategoriaEntrada } from '@gastos/shared';
import { ErrorConflicto } from '../../domain/errors/errores-dominio.js';
import type { RepositorioCategorias } from '../ports/repositorio-categorias.js';

export class CrearCategoria {
  constructor(private readonly categorias: RepositorioCategorias) {}

  async ejecutar(uid: string, entrada: CategoriaEntrada): Promise<Categoria> {
    if (await this.categorias.existeNombre(uid, entrada.nombre)) {
      throw new ErrorConflicto('Ya existe una categoría con ese nombre');
    }
    return this.categorias.crear(uid, entrada);
  }
}
