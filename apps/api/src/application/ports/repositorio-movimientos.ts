export interface RepositorioMovimientos {
  contarPorCategoria(uid: string, categoriaId: string): Promise<number>;
}
