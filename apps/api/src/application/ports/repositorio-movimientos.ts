import type {
  FiltrosMovimientos,
  Movimiento,
  MovimientoEntrada,
  Pagina,
  Paginacion,
} from '@gastos/shared';

export interface RepositorioMovimientos {
  listar(
    uid: string,
    filtros: FiltrosMovimientos,
    paginacion: Paginacion,
  ): Promise<Pagina<Movimiento>>;
  listarPorRango(uid: string, desde: string, hasta: string): Promise<readonly Movimiento[]>;
  obtener(uid: string, id: string): Promise<Movimiento | null>;
  crear(uid: string, entrada: MovimientoEntrada): Promise<Movimiento>;
  actualizar(uid: string, id: string, entrada: MovimientoEntrada): Promise<Movimiento>;
  eliminar(uid: string, id: string): Promise<void>;
  contarPorCategoria(uid: string, categoriaId: string): Promise<number>;
}
