import type { Categoria } from '@gastos/shared';
import type { RepositorioCategorias } from '../ports/repositorio-categorias.js';

export class ListarCategorias {
  constructor(private readonly categorias: RepositorioCategorias) {}

  ejecutar(uid: string): Promise<readonly Categoria[]> {
    return this.categorias.listar(uid);
  }
}
