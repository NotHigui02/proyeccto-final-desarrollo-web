import { randomUUID } from 'node:crypto';
import type { Categoria, CategoriaEntrada } from '@gastos/shared';
import type { DocumentData, Firestore } from 'firebase-admin/firestore';
import type { RepositorioCategorias } from '../../application/ports/repositorio-categorias.js';
import { normalizarNombreCategoria } from '../../domain/categorias/nombre-categoria.js';
import { ErrorConflicto, ErrorNoEncontrado } from '../../domain/errors/errores-dominio.js';
import { coleccionCategorias, coleccionNombresCategoria } from './rutas-usuario.js';

function mapearCategoria(id: string, datos: DocumentData): Categoria {
  return {
    id,
    nombre: String(datos.nombre),
    color: String(datos.color),
  };
}

export class RepositorioCategoriasFirestore implements RepositorioCategorias {
  constructor(private readonly db: Firestore) {}

  async listar(uid: string): Promise<readonly Categoria[]> {
    const snap = await coleccionCategorias(this.db, uid).orderBy('nombre').get();
    return snap.docs.map((doc) => mapearCategoria(doc.id, doc.data()));
  }

  async obtener(uid: string, id: string): Promise<Categoria | null> {
    const doc = await coleccionCategorias(this.db, uid).doc(id).get();
    if (!doc.exists) return null;
    return mapearCategoria(doc.id, doc.data() ?? {});
  }

  async crear(uid: string, entrada: CategoriaEntrada): Promise<Categoria> {
    const id = randomUUID();
    const claveNombre = normalizarNombreCategoria(entrada.nombre);
    const refCategoria = coleccionCategorias(this.db, uid).doc(id);
    const refNombre = coleccionNombresCategoria(this.db, uid).doc(claveNombre);

    await this.db.runTransaction(async (tx) => {
      const indice = await tx.get(refNombre);
      if (indice.exists) {
        throw new ErrorConflicto('Ya existe una categoría con ese nombre');
      }
      tx.create(refNombre, { categoriaId: id });
      tx.create(refCategoria, { nombre: entrada.nombre, color: entrada.color });
    });

    return { id, ...entrada };
  }

  async actualizar(uid: string, id: string, entrada: CategoriaEntrada): Promise<Categoria> {
    const refCategoria = coleccionCategorias(this.db, uid).doc(id);
    const claveNueva = normalizarNombreCategoria(entrada.nombre);

    await this.db.runTransaction(async (tx) => {
      const actual = await tx.get(refCategoria);
      if (!actual.exists) {
        throw new ErrorNoEncontrado('Categoría no encontrada');
      }
      const nombreAnterior = String(actual.data()?.nombre ?? '');
      const claveAnterior = normalizarNombreCategoria(nombreAnterior);
      const refNombreNueva = coleccionNombresCategoria(this.db, uid).doc(claveNueva);

      if (claveAnterior !== claveNueva) {
        const ocupado = await tx.get(refNombreNueva);
        if (ocupado.exists) {
          throw new ErrorConflicto('Ya existe una categoría con ese nombre');
        }
        tx.delete(coleccionNombresCategoria(this.db, uid).doc(claveAnterior));
        tx.create(refNombreNueva, { categoriaId: id });
      }

      tx.set(refCategoria, { nombre: entrada.nombre, color: entrada.color });
    });

    return { id, ...entrada };
  }

  async eliminar(uid: string, id: string): Promise<void> {
    const refCategoria = coleccionCategorias(this.db, uid).doc(id);

    await this.db.runTransaction(async (tx) => {
      const actual = await tx.get(refCategoria);
      if (!actual.exists) {
        throw new ErrorNoEncontrado('Categoría no encontrada');
      }
      const nombre = String(actual.data()?.nombre ?? '');
      tx.delete(coleccionNombresCategoria(this.db, uid).doc(normalizarNombreCategoria(nombre)));
      tx.delete(refCategoria);
    });
  }

  async existeNombre(uid: string, nombre: string, exceptoId?: string): Promise<boolean> {
    const doc = await coleccionNombresCategoria(this.db, uid)
      .doc(normalizarNombreCategoria(nombre))
      .get();
    if (!doc.exists) return false;
    if (exceptoId !== undefined && doc.data()?.categoriaId === exceptoId) return false;
    return true;
  }
}
