import type { Categoria, Movimiento } from '@gastos/shared';

export interface RepositorioDatos {
  listarCategorias(): Promise<readonly Categoria[]>;
  listarMovimientos(): Promise<readonly Movimiento[]>;
}
