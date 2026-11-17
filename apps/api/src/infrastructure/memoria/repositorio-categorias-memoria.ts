import { randomUUID } from 'node:crypto';
import type { Categoria, CategoriaEntrada } from '@gastos/shared';
import type { RepositorioCategorias } from '../../application/ports/repositorio-categorias.js';
import { normalizarNombreCategoria } from '../../domain/categorias/nombre-categoria.js';
import { ErrorNoEncontrado } from '../../domain/errors/errores-dominio.js';
import { CATEGORIAS_SEMILLA, UID_DEMO } from './semilla.js';

export class RepositorioCategoriasMemoria implements RepositorioCategorias {
  private readonly porUsuario = new Map<string, Map<string, Categoria>>();

  constructor(semilla: readonly Categoria[] = CATEGORIAS_SEMILLA, uid = UID_DEMO) {
    const mapa = new Map<string, Categoria>();
    for (const categoria of semilla) {
      mapa.set(categoria.id, { ...categoria });
    }
    this.porUsuario.set(uid, mapa);
  }

  listar(uid: string): Promise<readonly Categoria[]> {
    const items = [...this.mapaDe(uid).values()].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es'),
    );
    return Promise.resolve(items);
  }

  obtener(uid: string, id: string): Promise<Categoria | null> {
    return Promise.resolve(this.mapaDe(uid).get(id) ?? null);
  }

  crear(uid: string, entrada: CategoriaEntrada): Promise<Categoria> {
    const categoria: Categoria = { id: randomUUID(), ...entrada };
    this.mapaDe(uid).set(categoria.id, categoria);
    return Promise.resolve(categoria);
  }

  actualizar(uid: string, id: string, entrada: CategoriaEntrada): Promise<Categoria> {
    const mapa = this.mapaDe(uid);
    if (!mapa.has(id)) {
      return Promise.reject(new ErrorNoEncontrado('Categoría no encontrada'));
    }
    const categoria: Categoria = { id, ...entrada };
    mapa.set(id, categoria);
    return Promise.resolve(categoria);
  }

  eliminar(uid: string, id: string): Promise<void> {
    const mapa = this.mapaDe(uid);
    if (!mapa.has(id)) {
      return Promise.reject(new ErrorNoEncontrado('Categoría no encontrada'));
    }
    mapa.delete(id);
    return Promise.resolve();
  }

  existeNombre(uid: string, nombre: string, exceptoId?: string): Promise<boolean> {
    const normalizado = normalizarNombreCategoria(nombre);
    for (const categoria of this.mapaDe(uid).values()) {
      if (exceptoId !== undefined && categoria.id === exceptoId) continue;
      if (normalizarNombreCategoria(categoria.nombre) === normalizado) {
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }

  private mapaDe(uid: string): Map<string, Categoria> {
    let mapa = this.porUsuario.get(uid);
    if (!mapa) {
      mapa = new Map();
      this.porUsuario.set(uid, mapa);
    }
    return mapa;
  }
}
