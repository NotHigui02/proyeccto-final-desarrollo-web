import type { Categoria, CategoriaEntrada } from '@gastos/shared';

export interface RepositorioCategorias {
  listar(uid: string): Promise<readonly Categoria[]>;
  obtener(uid: string, id: string): Promise<Categoria | null>;
  crear(uid: string, entrada: CategoriaEntrada): Promise<Categoria>;
  actualizar(uid: string, id: string, entrada: CategoriaEntrada): Promise<Categoria>;
  eliminar(uid: string, id: string): Promise<void>;
  /** Unicidad sin distinguir mayúsculas. `exceptoId` excluye la categoría en edición. */
  existeNombre(uid: string, nombre: string, exceptoId?: string): Promise<boolean>;
}
